-- =============================================================================
-- Tamandaré Participa — DDL consolidado
-- =============================================================================
-- Junta:
--   - PRD v1.0 §6 (profiles, macroareas, contributions, contribution_themes,
--                  document_chunks, chat_sessions, chat_messages,
--                  moderation_log, reports)
--   - Adendo v1.1 §3 (geocode_cache, elevation_cache, streetview_cache)
-- Aplicar pelo SQL editor do Supabase Studio (em ordem):
--   1. schema.sql (este)
--   2. functions.sql (match_chunks pro RAG)
--   3. policies.sql (RLS)
-- =============================================================================

-- Extensions
create extension if not exists vector;
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- profiles
-- Estende auth.users do Supabase. CPF é sempre hasheado (sha256+salt).
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  cpf_hash text,
  is_resident boolean default false,
  resident_macroarea text,
  role text default 'citizen',          -- citizen | moderator | admin
  created_at timestamptz default now()
);

comment on table profiles is
  'Perfis de usuário. PRD v1.0 §6. CPF é hash (nunca cru).';

-- -----------------------------------------------------------------------------
-- macroareas
-- 10 macroáreas da proposta de zoneamento + geojson dos polígonos.
-- Seed via db/seed/macroareas.example.json.
-- -----------------------------------------------------------------------------
create table if not exists macroareas (
  slug text primary key,
  name text not null,
  display_color text,
  description_plain text,
  description_official text,
  geojson jsonb not null,
  changes_from_current text,
  attention_points text[]
);

comment on table macroareas is
  'Macroáreas propostas pelo Plano Diretor revisado. PRD v1.0 §6 + adendo v1.2 §3.1.';

-- -----------------------------------------------------------------------------
-- contributions
-- Coração do produto. Toda contribuição cidadã passa por aqui.
-- -----------------------------------------------------------------------------
create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  is_anonymous boolean default false,
  category text not null,
  macroarea_slug text references macroareas(slug),
  location geography(point, 4326),
  location_address text,
  title text,
  body text not null check (length(body) >= 50),
  sentiment text,                       -- 'agree' | 'agree_with_reservations' | 'disagree'
  attachments jsonb default '[]',
  status text default 'pending',        -- pending | published | flagged | spam
  moderator_notes text,
  hash_integrity text,                  -- sha256(body + timestamp + user_id)
  created_at timestamptz default now(),
  published_at timestamptz
);

comment on table contributions is
  'Contribuições cidadãs georreferenciadas. PRD v1.0 §6.';

create index if not exists idx_contrib_macroarea on contributions(macroarea_slug);
create index if not exists idx_contrib_category on contributions(category);
create index if not exists idx_contrib_location on contributions using gist(location);
create index if not exists idx_contrib_status on contributions(status);

-- -----------------------------------------------------------------------------
-- contribution_themes
-- Temas extraídos por NLP (Gemini). Populado por job noturno no MVP 2.
-- -----------------------------------------------------------------------------
create table if not exists contribution_themes (
  contribution_id uuid references contributions(id) on delete cascade,
  theme text,
  confidence numeric,
  primary key (contribution_id, theme)
);

comment on table contribution_themes is
  'Tags semânticas extraídas via NLP. PRD v1.0 §6.';

-- -----------------------------------------------------------------------------
-- document_chunks
-- Base RAG: chunks dos 2 PDFs (Circular + Caderno ICR) + embeddings Gemini.
-- text-embedding-004 → vector(768).
-- -----------------------------------------------------------------------------
create table if not exists document_chunks (
  id bigserial primary key,
  source text not null,                 -- 'circular' | 'caderno'
  section text,                         -- section_slug do frontmatter
  chunk_index int not null default 0,   -- ordem do chunk dentro da seção
  page_number int,                      -- página de origem (primeira página do chunk)
  content text not null,
  embedding vector(768),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  unique (source, section, chunk_index) -- idempotência do pipeline de embedding
);

comment on table document_chunks is
  'Chunks dos documentos oficiais com embeddings pra RAG. PRD v1.0 §6 + §7. '
  'scripts/embed-docs.ts faz upsert via unique(source, section, chunk_index).';

create index if not exists idx_chunks_embedding
  on document_chunks using ivfflat (embedding vector_cosine_ops);
create index if not exists idx_chunks_source on document_chunks(source);

-- -----------------------------------------------------------------------------
-- chat_sessions / chat_messages
-- Histórico de conversas com o assistente RAG.
-- -----------------------------------------------------------------------------
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  anon_session_id text,
  created_at timestamptz default now()
);

comment on table chat_sessions is
  'Sessões do chat IA. Suporta usuário logado ou anônimo. PRD v1.0 §6.';

create table if not exists chat_messages (
  id bigserial primary key,
  session_id uuid references chat_sessions(id) on delete cascade,
  role text not null,                   -- 'user' | 'assistant' | 'system'
  content text not null,
  cited_chunks bigint[],
  tokens_used int,
  created_at timestamptz default now()
);

comment on table chat_messages is
  'Mensagens do chat com IDs dos chunks citados (auditável). PRD v1.0 §6.';

create index if not exists idx_chat_messages_session on chat_messages(session_id);

-- -----------------------------------------------------------------------------
-- moderation_log
-- Auditoria de ações de moderação.
-- -----------------------------------------------------------------------------
create table if not exists moderation_log (
  id bigserial primary key,
  contribution_id uuid references contributions(id),
  moderator_id uuid references profiles(id),
  action text not null,                 -- 'approve' | 'flag' | 'spam' | 'edit'
  reason text,
  created_at timestamptz default now()
);

comment on table moderation_log is
  'Log auditável de moderação. PRD v1.0 §6.';

-- -----------------------------------------------------------------------------
-- reports
-- Relatórios consolidados pra protocolo junto à Prefeitura.
-- -----------------------------------------------------------------------------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  generated_by uuid references profiles(id),
  period_start date,
  period_end date,
  total_contributions int,
  pdf_url text,
  csv_url text,
  summary_json jsonb,
  created_at timestamptz default now()
);

comment on table reports is
  'Relatórios consolidados gerados pra protocolo na Prefeitura. PRD v1.0 §6.';

-- =============================================================================
-- Caches de APIs Google — adendo v1.1 §3
-- =============================================================================

-- -----------------------------------------------------------------------------
-- geocode_cache
-- Cache de Geocoding API (endereço → coordenadas). TTL 30 dias.
-- -----------------------------------------------------------------------------
create table if not exists geocode_cache (
  query_hash text primary key,
  query_original text,
  lat numeric(10, 7),
  lng numeric(10, 7),
  formatted_address text,
  macroarea_slug text,
  raw_response jsonb,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days')
);

comment on table geocode_cache is
  'Cache de Google Geocoding API. TTL 30 dias. Adendo v1.1 §3.';

create index if not exists idx_geocode_expires on geocode_cache(expires_at);

-- -----------------------------------------------------------------------------
-- elevation_cache
-- Cache de Elevation API. Permanente (altitude não muda).
-- Coordenada arredondada a 4 decimais (~11m precisão).
-- -----------------------------------------------------------------------------
create table if not exists elevation_cache (
  lat_rounded numeric(7, 4),
  lng_rounded numeric(7, 4),
  elevation_meters numeric(8, 2),
  resolution_meters numeric(6, 2),
  created_at timestamptz default now(),
  primary key (lat_rounded, lng_rounded)
);

comment on table elevation_cache is
  'Cache permanente de Google Elevation API. Adendo v1.1 §3.';

-- -----------------------------------------------------------------------------
-- streetview_cache
-- Cache de Street View Static (foto baixada salva no Supabase Storage).
-- -----------------------------------------------------------------------------
create table if not exists streetview_cache (
  lat_rounded numeric(7, 4),
  lng_rounded numeric(7, 4),
  heading int default 0,
  storage_path text,
  has_imagery boolean,
  created_at timestamptz default now(),
  primary key (lat_rounded, lng_rounded, heading)
);

comment on table streetview_cache is
  'Cache de Google Street View Static. Adendo v1.1 §3.';
