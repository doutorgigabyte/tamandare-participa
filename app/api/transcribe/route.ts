import { NextResponse } from 'next/server';

/**
 * POST /api/transcribe
 *
 * Transcrição de áudio via Cloud Speech-to-Text (pt-BR).
 *
 * Quando implementado (adendo v1.1 §1.3 + §7.3 + §4.3):
 *   - Recebe multipart/form-data com campo 'audio' (WEBM_OPUS recomendado).
 *   - SpeechClient(credentials: JSON.parse(GCP_AI_CREDENTIALS)).recognize({
 *       audio: { content: base64 },
 *       config: {
 *         encoding: 'WEBM_OPUS',
 *         sampleRateHertz: 48000,
 *         languageCode: 'pt-BR',
 *         enableAutomaticPunctuation: true,
 *         model: 'latest_long',
 *       },
 *     })
 *   - Retorna { transcript }.
 *   - Áudio original fica salvo no Storage como anexo (transparência).
 */
export async function POST() {
  return NextResponse.json(
    { error: 'not implemented yet', stub: true },
    { status: 501 },
  );
}
