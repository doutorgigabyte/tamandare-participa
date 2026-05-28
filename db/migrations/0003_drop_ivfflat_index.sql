-- Migration 0003: drop ivfflat index on document_chunks.embedding
--
-- Por que: com 50 chunks (e <10k previstos), ivfflat com probes=1 (default
-- do PostgreSQL) clusteriza mal e descarta queries cujo centroid não tem
-- match. Resultado: `match_chunks()` retornava 0 rows pra ~metade das
-- perguntas em prod, deixando o chat com fallback canned ("Esse ponto não
-- está nos documentos...") mesmo quando havia chunks com similaridade > 0.6.
--
-- Solução: derrubar o índice. Full scan em 50 rows é <50ms.
-- Re-criar com HNSW quando passarmos de ~10k chunks.

drop index if exists public.idx_chunks_embedding;
