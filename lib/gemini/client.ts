import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Cliente Gemini compartilhado — APENAS pra embeddings + fallback do Gateway.
 *
 * Use este módulo direto SÓ pra:
 *   - text-embedding-004 (embeddings dos chunks RAG) — não há endpoint
 *     de embedding no Gateway Dr GB
 *
 * Pra chat/generate, use `lib/gateway/client.ts` — ele já implementa
 * fast-path no Gateway com fallback transparente pra este SDK.
 *
 * Modelos em uso:
 *   - gemini-2.5-flash       → chat principal (PRD v1.0 §3.1, §7)
 *   - text-embedding-004     → embeddings dos chunks RAG (vector(768))
 */

if (!process.env.GEMINI_API_KEY) {
  // Não throwa em build time — só quando alguém de fato chama a API.
  // eslint-disable-next-line no-console
  console.warn(
    '[gemini] GEMINI_API_KEY não está definida. Chamadas ao Gemini vão falhar.',
  );
}

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export const GEMINI_CHAT_MODEL = 'gemini-2.5-flash';
export const GEMINI_EMBEDDING_MODEL = 'text-embedding-004';
