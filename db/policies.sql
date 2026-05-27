-- =============================================================================
-- Tamandaré Participa — Row Level Security policies
-- =============================================================================
-- Aplicar APÓS schema.sql.
-- Baseado em PRD v1.0 §6 (RLS — política mínima) + extensão pra chat_messages.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- contributions
-- -----------------------------------------------------------------------------
alter table contributions enable row level security;

-- Qualquer pessoa lê contribuições publicadas (transparência ativa).
drop policy if exists "public read published" on contributions;
create policy "public read published"
  on contributions for select
  using (status = 'published');

-- Usuário autenticado cria a própria contribuição.
-- Anônimo (is_anonymous=true) pode inserir sem auth.uid().
drop policy if exists "user inserts own" on contributions;
create policy "user inserts own"
  on contributions for insert
  with check (auth.uid() = user_id or is_anonymous = true);

-- Só moderador/admin atualiza status, notas, etc.
drop policy if exists "moderator updates" on contributions;
create policy "moderator updates"
  on contributions for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('moderator', 'admin')
    )
  );

-- -----------------------------------------------------------------------------
-- chat_messages
-- Extensão do PRD: SELECT só na própria sessão.
-- Evita vazamento de histórico de outros usuários.
-- -----------------------------------------------------------------------------
alter table chat_messages enable row level security;

drop policy if exists "user reads own session messages" on chat_messages;
create policy "user reads own session messages"
  on chat_messages for select
  using (
    exists (
      select 1 from chat_sessions s
      where s.id = chat_messages.session_id
        and (
          s.user_id = auth.uid()
          or s.anon_session_id = current_setting('request.headers', true)::json->>'x-anon-session-id'
        )
    )
  );

-- Inserts via service role (route handlers).
-- Não criamos policy de insert pública; o backend usa SUPABASE_SERVICE_ROLE_KEY.

-- -----------------------------------------------------------------------------
-- chat_sessions
-- Mesma lógica: usuário lê só suas sessões.
-- -----------------------------------------------------------------------------
alter table chat_sessions enable row level security;

drop policy if exists "user reads own sessions" on chat_sessions;
create policy "user reads own sessions"
  on chat_sessions for select
  using (
    user_id = auth.uid()
    or anon_session_id = current_setting('request.headers', true)::json->>'x-anon-session-id'
  );

-- -----------------------------------------------------------------------------
-- macroareas
-- Leitura pública. Updates só por admin via service role.
-- -----------------------------------------------------------------------------
alter table macroareas enable row level security;

drop policy if exists "public read macroareas" on macroareas;
create policy "public read macroareas"
  on macroareas for select
  using (true);

-- -----------------------------------------------------------------------------
-- profiles
-- Usuário lê o próprio perfil. Admin lê todos.
-- -----------------------------------------------------------------------------
alter table profiles enable row level security;

drop policy if exists "user reads own profile" on profiles;
create policy "user reads own profile"
  on profiles for select
  using (id = auth.uid() or exists (
    select 1 from profiles p2
    where p2.id = auth.uid() and p2.role in ('moderator', 'admin')
  ));

drop policy if exists "user updates own profile" on profiles;
create policy "user updates own profile"
  on profiles for update
  using (id = auth.uid());
