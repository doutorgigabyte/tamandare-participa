/**
 * Tipos compartilhados do chat IA (RAG sobre Circular + Caderno ICR).
 * PRD v1.0 §5.4 + §7.
 */

export type DocumentSource = 'caderno' | 'circular';

export type Citation = {
  chunk_id: number;
  source: DocumentSource;
  page_number: number | null;
  similarity: number;
  excerpt: string; // primeiros ~200 chars do chunk pra preview
};

export type ChatMessageRole = 'user' | 'assistant';

export type ChatMessageDTO = {
  id: number;
  session_id: string;
  role: ChatMessageRole;
  content: string;
  citations?: Citation[];
  created_at: string;
};

export type ChatPostResponse = {
  session_id: string;
  message: ChatMessageDTO;
  citations: Citation[];
  via_gateway: boolean;
};

export type ChatPostError = {
  error:
    | 'invalid_json'
    | 'validation_failed'
    | 'infra_pending'
    | 'no_matches'
    | 'llm_failed'
    | 'db_error';
  detail: string;
  field_errors?: Record<string, string>;
};

export type SuggestedQuestion = {
  id: string;
  text: string;
  topic: string; // pra analytics/agrupamento futuro
};
