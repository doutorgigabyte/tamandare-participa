import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { gateway } from '@/lib/gateway/client';

/**
 * POST /api/transcribe
 *
 * Recebe um blob de áudio (multipart/form-data field "audio") do componente
 * AudioRecorder, sobe pro Supabase Storage (bucket público 'contribuicoes-publico')
 * e chama o Gateway Dr GB → AssemblyAI pra transcrever.
 *
 * Retorna { text, audio_url }. O caller (StepBody) usa `text` pra preencher o
 * textarea e `audio_url` pra persistir junto com a contribuição (lista pública
 * pode oferecer o áudio original pra reproduzir).
 *
 * Constraint:
 *   - Tamanho máx: 10 MB (bate com bucket policy)
 *   - Formatos: webm/opus, mp4 (Safari iOS), mp3, ogg, wav
 */

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = [
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
];

const BUCKET = 'contribuicoes-publico';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ErrorBody = { error: string; detail?: string };

function err(body: ErrorBody, status: number) {
  return NextResponse.json(body, { status });
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url
      && key
      && !url.includes('your-project')
      && !key.includes('REPLACE-ME'),
  );
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return err(
      { error: 'infra_pending', detail: 'Storage indisponível (Supabase off).' },
      503,
    );
  }
  if (!gateway.isConfigured()) {
    return err(
      {
        error: 'infra_pending',
        detail: 'Transcrição requer Gateway Dr GB ativo (DRGB_GATEWAY_ENABLED).',
      },
      503,
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return err({ error: 'invalid_request', detail: 'Esperado multipart/form-data.' }, 400);
  }

  const file = form.get('audio');
  if (!(file instanceof Blob)) {
    return err({ error: 'missing_audio', detail: 'Campo "audio" ausente ou inválido.' }, 400);
  }
  if (file.size === 0) {
    return err({ error: 'empty_audio', detail: 'Áudio vazio.' }, 400);
  }
  if (file.size > MAX_BYTES) {
    return err(
      {
        error: 'audio_too_large',
        detail: `Áudio com ${(file.size / 1024 / 1024).toFixed(1)} MB excede o limite de 10 MB.`,
      },
      413,
    );
  }
  // Normaliza o mime: AssemblyAI rejeita "audio/webm;codecs=opus" — só aceita
  // "audio/webm" puro. Tira o sufixo de codecs do Content-Type que o navegador
  // gera (especialmente Chrome com MediaRecorder webm/opus).
  const mime = (file.type || 'audio/webm').split(';')[0].trim();
  if (!ALLOWED_MIMES.includes(mime)) {
    return err(
      { error: 'unsupported_mime', detail: `Formato ${mime} não suportado.` },
      415,
    );
  }

  // 1) Upload pro Storage ---------------------------------------------------
  const supabase = createServiceClient();
  const ext = mime === 'audio/mp4'
    ? 'mp4'
    : mime === 'audio/mpeg'
      ? 'mp3'
      : mime === 'audio/ogg'
        ? 'ogg'
        : mime === 'audio/wav'
          ? 'wav'
          : 'webm';
  const id = randomUUID();
  const path = `audios/${new Date().toISOString().slice(0, 10)}/${id}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mime, // sem ";codecs=opus" — AssemblyAI rejeita
      upsert: false,
    });

  if (uploadErr) {
    // eslint-disable-next-line no-console
    console.error('[transcribe] upload falhou:', uploadErr);
    return err(
      {
        error: 'storage_error',
        detail:
          uploadErr.message.includes('not found') || uploadErr.message.includes('Bucket')
            ? 'Bucket "contribuicoes-publico" não existe. Rode a migration 0002_audio_display_name_storage.sql.'
            : uploadErr.message,
      },
      500,
    );
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const audioUrl = pub.publicUrl;
  if (!audioUrl) {
    return err({ error: 'storage_error', detail: 'Sem URL pública após upload.' }, 500);
  }

  // 2) Transcrever via Gateway → AssemblyAI --------------------------------
  try {
    const result = await gateway.voice.transcribe({
      audio_url: audioUrl,
      language: 'pt',
    });
    return NextResponse.json({
      text: result.text,
      audio_url: audioUrl,
      provider: result.provider ?? 'assemblyai',
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[transcribe] gateway falhou:', e);
    // O áudio já foi subido — devolvemos a URL pro caller poder reaproveitar
    // se quiser tentar de novo, e deletamos depois (cleanup async).
    void supabase.storage.from(BUCKET).remove([path]);
    return err(
      {
        error: 'transcription_failed',
        detail: (e as Error).message,
      },
      502,
    );
  }
}
