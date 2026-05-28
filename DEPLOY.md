# Deploy — Coolify + Supabase

Plataforma pronta pra subir. Resta apenas: provisionar Supabase + criar
app no Coolify + colar env vars. ~15 minutos do teu tempo.

## Estado atual ✅

- ✅ `npm install` (1057 pacotes, sem vulnerabilidades novas)
- ✅ `npm run type-check` (0 erros)
- ✅ `npm run build` (15 rotas, 5 indicadores + 10 macroáreas pré-rendered)
- ✅ Git inicializado + push pra GitHub: https://github.com/doutorgigabyte/tamandare-participa (privado)
- ✅ Dockerfile multi-stage pronto (output: standalone)
- ✅ Coolify confirmado em http://185.100.215.206:8000

## Falta — 3 ações tuas (~15 min)

### 1. Supabase — provisionar + autenticar MCP

Já tens o project `wwrrzgvwtohmjzoljcnj`. No PowerShell:

```powershell
claude /mcp
```

Seleciona **supabase** → **Authenticate** → browser abre → autoriza.

Depois disso, na próxima sessão aqui, eu aplico os 3 SQLs (`schema.sql`,
`functions.sql`, `policies.sql`) direto via MCP, sem tu abrir o SQL Editor.

### 2. Gemini API key

Em https://aistudio.google.com → "Get API key" (grátis). Cole no Coolify
(passo 3 abaixo) como `GEMINI_API_KEY`.

### 3. Coolify — criar app + env vars

Dashboard: http://185.100.215.206:8000 (login com tua conta)

#### 3.1. Novo recurso

`+ Add Resource` → `Public Repository` → cola:

```
https://github.com/doutorgigabyte/tamandare-participa
```

Build pack: **Dockerfile** (já tem `Dockerfile` no repo).

#### 3.2. Domain

Sugestão pragmática (zero-config, instantâneo):
```
tamandare-participa.185.100.215.206.sslip.io
```

Ou apontar `tamandareparticipa.com.br` (registrar + CNAME).

#### 3.3. Env vars — cola este bloco no Environment Variables do Coolify

```bash
# Public (NEXT_PUBLIC_*) — vão no bundle do client
NEXT_PUBLIC_APP_URL=https://tamandare-participa.185.100.215.206.sslip.io
NEXT_PUBLIC_CONTRIBUTION_DEADLINE=2026-05-31T23:59:59-03:00
NEXT_PUBLIC_SUPABASE_URL=https://wwrrzgvwtohmjzoljcnj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<vem do Supabase Dashboard → Settings → API → anon public>

# Gateway Dr GB
DRGB_GATEWAY_URL=http://nylgaos7wzl2b193jwqgu53j.185.100.215.206.sslip.io
DRGB_GATEWAY_TOKEN=<vem do teu .env.local — NUNCA commitar essa key>
DRGB_GATEWAY_ENABLED=true

# Secrets gerados (já no teu .env.local — copie de lá pro Coolify)
CPF_HASH_SALT=<copiar do .env.local>
ADMIN_TOKEN=<copiar do .env.local>
SUPABASE_SERVICE_ROLE_KEY=<Supabase Dashboard → Settings → API → service_role secret>
GEMINI_API_KEY=<AI Studio>

# Opcional — sem essas, /zoneamento mostra fallback + /api/elevation dá 500
NEXT_PUBLIC_GMAPS_FRONTEND_KEY=<opcional>
GMAPS_BACKEND_KEY=<opcional>
```

**Os valores reais de `CPF_HASH_SALT` e `ADMIN_TOKEN` estão no teu
`.env.local` local — copy/paste de lá.**

#### 3.4. Deploy

Click **Deploy**. Coolify constrói via Dockerfile, expõe na porta 3000
internamente, aplica SSL via Let's Encrypt no domain configurado.

Build ~5-10 min na primeira vez (npm install + build).

#### 3.5. Validar

Quando subir, me passa a URL do app no Coolify. Eu rodo:

```bash
BASE_URL=https://tua-url npm run smoke
```

Esperado: 25+/27 PASS (algumas 503 enquanto Supabase ainda não tem schema
aplicado).

## Após deploy: eu aplico schema + popula RAG

Quando voltar pra cá com:
1. MCP Supabase autenticado
2. App rodando no Coolify (mesmo que retornando 503 nas APIs)

Eu faço, autonomamente:
1. `mcp__supabase__apply_migration` com `db/schema.sql`
2. Idem `db/functions.sql` e `db/policies.sql`
3. `npm run embed:docs` (popula 44 chunks de RAG)
4. Smoke test contra prod
5. Eventual hotfix de bugs que aparecerem

## Custos esperados

- Supabase Free Tier: ✅ (500MB DB, 50K MAU)
- Coolify VPS: ✅ (já existente)
- Gemini API: ~R$0-30/mês (free tier ~1500 req/dia)
- Domain sslip.io: ✅ (grátis)
- Domain .com.br: ~R$40/ano (opcional)

**Total esperado nos primeiros 30 dias: ~R$0-30.**

## Troubleshooting

- **Coolify build fail "out of memory"**: aumente memória da VPS ou
  build em outra máquina + push imagem
- **`/chat` retorna 503**: Supabase schema não aplicado ainda → eu resolvo via MCP
- **`/api/contribute` retorna 503**: idem
- **Mapa de `/zoneamento` em branco**: `NEXT_PUBLIC_GMAPS_FRONTEND_KEY` ausente
  (fallback de lista funciona)
- **/admin → "Admin desabilitado"**: `ADMIN_TOKEN` não setado no Coolify
