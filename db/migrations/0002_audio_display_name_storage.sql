-- =============================================================================
-- Migration 0002 — display_name + audio_url + bucket de Storage público
-- =============================================================================
-- Aplicar via Supabase SQL Editor APÓS schema.sql + policies.sql + functions.sql.
--
-- Adiciona:
--   1. Coluna `display_name` em contributions (mostrada publicamente; é o
--      primeiro nome do contribuinte ou NULL se anônimo).
--   2. Coluna `audio_url` em contributions (URL pública do áudio gravado, se
--      a contribuição veio de gravação de voz transcrita via AssemblyAI).
--   3. Bucket de Storage `contribuicoes-publico` (leitura pública) pra
--      hospedar áudios e anexos de fotos. Uploads acontecem via API route
--      com SUPABASE_SERVICE_ROLE_KEY (bypassa RLS).
-- =============================================================================

-- 1) Colunas novas em contributions ------------------------------------------

alter table contributions
  add column if not exists display_name text,
  add column if not exists audio_url text;

comment on column contributions.display_name is
  'Primeiro nome do contribuinte (mostrado publicamente). NULL quando is_anonymous=true.';
comment on column contributions.audio_url is
  'URL pública do áudio original (se a contribuição veio via gravação de voz). '
  'Hospedado em storage://contribuicoes-publico/.';

-- 2) Bucket de Storage público -----------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contribuicoes-publico',
  'contribuicoes-publico',
  true,
  10485760, -- 10 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf',
    'audio/webm',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/wav'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table storage.buckets is
  'Bucket contribuicoes-publico armazena áudios e anexos. Leitura pública; '
  'uploads via service role na API route /api/transcribe e /api/contribute.';

-- 3) Garantir RLS de leitura pública em storage.objects desse bucket ---------
-- (Buckets public=true já são públicos pra GET, mas explicitando policy
-- pra evitar surpresa se alguém mexer no flag depois.)

drop policy if exists "contribuicoes_publico read" on storage.objects;
create policy "contribuicoes_publico read"
  on storage.objects for select
  using (bucket_id = 'contribuicoes-publico');

-- Inserts/Updates/Deletes nesse bucket NUNCA via anon — sempre via service
-- role na API route, que bypassa RLS. Não criamos policy de insert.
