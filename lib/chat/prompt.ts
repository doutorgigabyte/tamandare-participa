/**
 * Monta o prompt do turno RAG com os chunks recuperados.
 * Formato deliberado pra casar com o system prompt em lib/gemini/system-prompt.ts
 * (que pede citações no formato [Caderno ICR, p. N] ou [Circular 001-2026, item N]).
 */

import type { DocumentSource } from './types';

export type RetrievedChunk = {
  id: number;
  content: string;
  source: DocumentSource;
  page_number: number | null;
  similarity: number;
};

const LABELS: Record<DocumentSource, string> = {
  caderno: 'Caderno ICR',
  circular: 'Circular 001-2026',
};

export function buildPromptWithContext(
  question: string,
  chunks: RetrievedChunk[],
): string {
  const contextBlock = chunks
    .map((c) => {
      const ref = c.page_number !== null ? `p. ${c.page_number}` : 'doc';
      return `[${LABELS[c.source]}, ${ref}]\n${c.content}`;
    })
    .join('\n\n---\n\n');

  return `CONTEXTO (use APENAS esses trechos pra fundamentar a resposta):\n\n${contextBlock}\n\n---\n\nPERGUNTA: ${question}`;
}

/**
 * Mensagem canned quando 0 chunks atingem o threshold de similaridade.
 * Evita gastar tokens do LLM com pergunta inválida, e respeita a regra 3
 * do system prompt.
 */
export const NO_MATCHES_RESPONSE = `Esse ponto não está nos documentos oficiais que tenho acesso (Circular 001-2026 e Caderno ICR).

Posso te ajudar com outra dúvida sobre o Plano Diretor? Tenta perguntar sobre macroáreas, parâmetros urbanísticos, indicadores de habitação/mobilidade/vegetação, ou patrimônio histórico.`;
