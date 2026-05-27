'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AudioRecorder — gravação de voz com MediaRecorder + transcrição via /api/transcribe.
 *
 * Fluxo:
 *   1. User clica "Gravar" → solicita permissão de microfone → grava em webm/opus
 *   2. "Parar" → mostra player + botão "Transcrever"
 *   3. "Transcrever" → POST /api/transcribe (blob multipart) → AssemblyAI via Gateway
 *   4. Retorna texto → `onTranscribed(text, audioUrl)`
 *   5. Caller (StepBody) preenche textarea + guarda audioUrl pra persistir no submit
 *
 * Pensado pra cidadãos que não escrevem com facilidade — UX deve ser óbvia:
 *   um botão grande "Gravar", parar, transcrever. Texto vem pronto pra editar
 *   se a pessoa quiser.
 */

const MAX_DURATION_MS = 5 * 60 * 1000; // 5 minutos
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (bate com bucket policy)

type Status = 'idle' | 'recording' | 'recorded' | 'transcribing' | 'error';

export function AudioRecorder({
  onTranscribed,
  disabled,
}: {
  onTranscribed: (text: string, audioUrl: string) => void;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioObjUrl, setAudioObjUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup global ao desmontar
  useEffect(() => {
    return () => {
      stopStream();
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (audioObjUrl) URL.revokeObjectURL(audioObjUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error('Seu navegador não suporta gravação de voz.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // mimeType preferido: webm/opus (suportado em Chrome/Firefox).
      // Safari iOS grava em audio/mp4 — também aceito pelo AssemblyAI.
      const mimeType =
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
              ? 'audio/mp4'
              : ''; // deixa o browser escolher

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        setBlob(finalBlob);
        const objUrl = URL.createObjectURL(finalBlob);
        setAudioObjUrl(objUrl);
        setStatus('recorded');
        stopStream();
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= MAX_DURATION_MS) {
          recorder.stop();
        }
      }, 250);

      recorder.start();
      setStatus('recording');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[audio] getUserMedia falhou:', err);
      toast.error(
        'Permissão de microfone negada ou indisponível. Verifique nas configurações do navegador.',
      );
      setStatus('error');
    }
  }, [stopStream]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
  }, []);

  const discard = useCallback(() => {
    if (audioObjUrl) URL.revokeObjectURL(audioObjUrl);
    setBlob(null);
    setAudioObjUrl(null);
    setElapsedMs(0);
    setStatus('idle');
    setIsPlaying(false);
  }, [audioObjUrl]);

  const togglePlay = useCallback(() => {
    const el = audioElRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, []);

  const transcribe = useCallback(async () => {
    if (!blob) return;
    if (blob.size > MAX_BYTES) {
      toast.error(
        `Áudio muito grande (${(blob.size / 1024 / 1024).toFixed(1)} MB, máx 10 MB). Grave uma versão mais curta.`,
      );
      return;
    }
    setStatus('transcribing');
    const fd = new FormData();
    fd.append('audio', blob, `gravacao.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`);
    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        throw new Error(err.detail ?? err.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { text: string; audio_url: string };
      if (!data.text || data.text.trim().length < 3) {
        toast.warning(
          'A transcrição veio vazia ou muito curta. Tente falar mais alto/perto do microfone.',
        );
        setStatus('recorded');
        return;
      }
      onTranscribed(data.text, data.audio_url);
      toast.success('Áudio transcrito! Revise o texto abaixo e edite se quiser.');
      // Mantém audio_url e blob disponíveis — usuário pode descartar manualmente
      setStatus('recorded');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[audio] transcribe falhou:', err);
      toast.error(`Falha ao transcrever: ${(err as Error).message}`);
      setStatus('recorded');
    }
  }, [blob, onTranscribed]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const elapsedLabel = formatMs(elapsedMs);
  const elapsedPct = Math.min(100, (elapsedMs / MAX_DURATION_MS) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-atlantico-mar-raso/15 text-atlantico-mar-profundo">
          <Mic className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Não quer escrever? Grave a sua contribuição
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Até 5 min. A gente transcreve, você revisa e envia.
          </p>
        </div>
      </div>

      {/* Botões principais */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {status === 'idle' && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-atlantico-terracota px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic className="h-4 w-4" aria-hidden />
            Começar a gravar
          </button>
        )}

        {status === 'recording' && (
          <>
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-atlantico-terracota px-5 py-2.5 text-sm font-medium text-white shadow-soft"
            >
              <Square className="h-4 w-4 fill-current" aria-hidden />
              Parar
            </button>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-atlantico-terracota" aria-hidden />
              Gravando · {elapsedLabel}
            </span>
          </>
        )}

        {status === 'recorded' && audioObjUrl && (
          <>
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" aria-hidden />
              ) : (
                <Play className="h-4 w-4" aria-hidden />
              )}
              {isPlaying ? 'Pausar' : 'Ouvir'}
            </button>
            <button
              type="button"
              onClick={transcribe}
              disabled={disabled}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-atlantico-mar-raso px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-atlantico-mar-profundo disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic className="h-4 w-4" aria-hidden />
              Transcrever pra texto
            </button>
            <button
              type="button"
              onClick={discard}
              disabled={disabled}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Descartar
            </button>
            <audio
              ref={audioElRef}
              src={audioObjUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              className="hidden"
            />
            <span className="text-xs text-muted-foreground">
              {elapsedLabel}
            </span>
          </>
        )}

        {status === 'transcribing' && (
          <span className="inline-flex items-center gap-2 text-sm text-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Transcrevendo… isso pode levar uns 10-30 segundos
          </span>
        )}
      </div>

      {/* Barra de progresso da duração */}
      {(status === 'recording' || status === 'recorded') && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-atlantico-mar-raso transition-all"
            style={{ width: `${elapsedPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
