# Tamandaré Participa

Plataforma cívica de participação qualificada na revisão do Plano Diretor de Tamandaré/PE.

**Prazo legal de protocolação de contribuições: 31/05/2026 23:59 BRT.**

---

## O que tem aqui

```
/                       Landing com countdown + live stats + teaser do diagnóstico
/audiencia              Convocação, fundamento legal, links pros PDFs oficiais
/diagnostico            Índice dos 5 indicadores
/diagnostico/[slug]     Detalhe de cada indicador com comparação e CTA
/zoneamento             Mapa interativo (Google Maps + deck.gl) das 10 macroáreas
/zoneamento/[slug]      Detalhe textual de cada macroárea
/chat                   Chat RAG sobre Circular + Caderno ICR (cita as páginas)
/contribuir             Wizard mobile-first de 8 etapas pra enviar contribuição
/resultados             Dashboard agregado (sem identidades) com ISR 30s
/sobre                  Quem fez + LGPD + política
/admin                  Fila de moderação (cookie auth com ADMIN_TOKEN)
```

API routes em `app/api/`:

```
POST /api/contribute        Recebe contribuição (valida, geocoda, hasheia, persiste)
POST /api/chat              RAG pipeline (embed query → match_chunks → gateway.llm.chat)
POST /api/elevation         Google Elevation com cache permanente em Postgres
POST /api/admin/login       Cookie-auth pro /admin
POST /api/admin/logout
POST /api/admin/moderate    Approve / spam / flag / unpublish
POST /api/transcribe        Speech-to-Text (stub — MVP 2)
GET  /api/streetview        Street View Static (stub)
```

---

## Stack

- **Next.js 14** App Router + TypeScript strict
- **Tailwind CSS** + lucide-react + sonner
- **Supabase** (Postgres + pgvector + PostGIS + Storage + RLS)
- **Google Maps Platform** via `@vis.gl/react-google-maps` + `deck.gl`
- **Gemini 2.5 Flash** (chat) + `text-embedding-004` (embeddings)
- **@google-cloud/speech** (transcribe), **@turf/turf** (point-in-polygon)
- **API Gateway Dr GB** unifica LLM/Maps/Voice com fallback transparente pros SDKs

Ver detalhes nos PRDs:
- `docs/sources/circular/001-2026.md` (Circular oficial extraída)
- `docs/sources/caderno/*.md` (Caderno ICR extraído em 7 seções)
- PRD v1.0 + adendos v1.1 (Google) e v1.2 (Camadas) no diretório do projeto

---

## Setup

### 1. Instalar deps

```bash
npm install
```

### 2. Configurar `.env.local`

Copie `.env.example` pra `.env.local` e preencha. Mínimo necessário pra rodar:

```bash
# Já preenchido em .env.local (não mexer):
DRGB_GATEWAY_URL=http://nylgaos7wzl2b193jwqgu53j.185.100.215.206.sslip.io
DRGB_GATEWAY_TOKEN=giga_...   # token do projeto "Tamandaré Participa"
DRGB_GATEWAY_ENABLED=true

# Você precisa preencher:
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...                      # https://aistudio.google.com (grátis)
NEXT_PUBLIC_GMAPS_FRONTEND_KEY=AIza...      # opcional — sem ela, /zoneamento mostra fallback
GMAPS_BACKEND_KEY=AIza...                   # pra /api/elevation (também fallback do Gateway)
CPF_HASH_SALT=...                           # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_TOKEN=...                             # idem acima
```

Variáveis opcionais (com fallback graceful quando ausentes): reCAPTCHA, PostHog, Earth Engine.

### 3. Provisionar Supabase

No SQL Editor do Supabase, executar em ordem:

```sql
-- 1. schema.sql        cria tabelas, índices, extensions (vector, postgis, pgcrypto)
-- 2. functions.sql     match_chunks() RPC pra RAG
-- 3. policies.sql      RLS public-read pra contributions published, etc.
```

### 4. Popular RAG

```bash
npm run embed:dry       # preview de quantos chunks vão ser gerados (~44, ~24k tokens)
npm run embed:docs      # gera embeddings via Gemini + upserta em document_chunks (~3s)
npm run rag:verify -- "Onde fica a Macroárea Social Morros?"   # testa o retrieval
```

### 5. Rodar

```bash
npm run dev             # http://localhost:3000
```

---

## Comandos

```bash
npm run dev             # dev server
npm run build           # build de produção
npm run start           # roda o build
npm run lint            # ESLint
npm run type-check      # tsc --noEmit
npm run embed:docs      # popular RAG com chunks dos .md
npm run embed:dry       # dry-run do embedding (não chama Gemini)
npm run rag:verify      # testa busca semântica
```

---

## Arquitetura crítica

### Gateway Dr GB com fallback transparente

`lib/gateway/client.ts` expõe `gateway.llm.chat()`, `gateway.maps.geocode()`, `gateway.voice.transcribe()`. Cada um tenta o Gateway primeiro; se Gateway off / network error / `success:false`, cai automaticamente pro SDK direto. Toggle via `DRGB_GATEWAY_ENABLED`.

Embeddings (Gemini `text-embedding-004`) NÃO passam pelo Gateway (não há endpoint) — vão direto via `@google/generative-ai`.

### Auto-publish (PRD §11.3)

`/api/contribute` calcula `score = assessment.score`. Se >= 0.7, contribuição entra como `published` (entra direto no `/resultados`). Entre 0.3 e 0.7, fica `pending` (precisa moderação humana via `/admin`). Score < 0.3 retorna 429.

Em dev sem `RECAPTCHA_SECRET_KEY`, o `assessAction()` bypassa retornando score=1 — todas viram `published` localmente.

### LGPD

- CPF hasheado com `sha256(salt || cpf)` quando informado; nunca cru.
- Cookie de admin é HTTP-only, sameSite=lax, 8h.
- `/contribuir` persiste draft em `sessionStorage` (some quando fecha aba). `consent_lgpd` é RESETADO no rehydrate — usuário reaprova a cada sessão.
- Em `/resultados` e em todas as visualizações públicas, identidades são excluídas no nível da query do Supabase (não dependem só do front).

### Hash de integridade

Cada contribuição grava `hash_integrity = sha256(body || timestamp || (user_id || 'anonymous'))`. Os primeiros 12 chars são exibidos como comprovante. Permite o cidadão provar depois que o conteúdo enviado é o que tá no banco.

### ISR estratégico

- `/` revalida 60s
- `/resultados` revalida 30s
- `/diagnostico` e `/zoneamento` são estáticos (`generateStaticParams`)
- `/admin` é `force-dynamic`

---

## Disclaimer

**Plataforma cívica independente.** Não substitui canais oficiais. Contribuições agregadas são protocoladas junto à Prefeitura para subsidiar — sem vincular — o processo legislativo.

Desenvolvida pela **Doutor Gigabyte** — 2026.
