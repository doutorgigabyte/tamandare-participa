-- =============================================================================
-- Tamandaré Participa — Funções PL/pgSQL
-- =============================================================================
-- Aplicar APÓS schema.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- match_chunks
-- Top-k retrieval pra RAG do chat IA.
-- Chamada por app/api/chat/route.ts via supabase.rpc('match_chunks', ...).
-- PRD v1.0 §7.3.
-- -----------------------------------------------------------------------------
create or replace function match_chunks(
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  source text,
  page_number int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.source,
    document_chunks.page_number,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

comment on function match_chunks is
  'Top-k cosine similarity sobre document_chunks. PRD v1.0 §7.3.';
