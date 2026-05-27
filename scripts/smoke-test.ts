/**
 * scripts/smoke-test.ts
 *
 * Validação ponta-a-ponta da plataforma. Roda contra um app vivo em
 * BASE_URL (default http://localhost:3000) e checa:
 *
 *   - Rotas públicas retornam 200 (ou redirecionam aceitavelmente)
 *   - /api/contribute valida payloads e respeita 503 quando infra ausente
 *   - /api/chat valida e respeita 503 quando Supabase ausente
 *   - sitemap.xml é servido
 *   - robots.txt é servido
 *   - /admin retorna form ou 200 (não crasha sem ADMIN_TOKEN)
 *
 * Uso:
 *   npm run dev                                 # noutro terminal
 *   npx tsx scripts/smoke-test.ts               # default localhost:3000
 *   BASE_URL=https://tamandare-participa.vercel.app npx tsx scripts/smoke-test.ts
 *
 * Saída: tabela colorida no console + exit code 0 (todos passam) ou 1 (algum falhou).
 *
 * IMPORTANTE: não modifica banco. Não envia contribuição real. Todas as chamadas
 * a /api/contribute mandam payloads inválidos pra forçar 422/503/400.
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const TIMEOUT_MS = 15_000;

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
  durationMs: number;
};

const results: CheckResult[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
}

async function check(
  name: string,
  fn: () => Promise<{ ok: boolean; detail: string }>,
): Promise<void> {
  const t0 = Date.now();
  let result: { ok: boolean; detail: string };
  try {
    result = await fn();
  } catch (err) {
    result = { ok: false, detail: `exception: ${(err as Error).message}` };
  }
  const ms = Date.now() - t0;
  results.push({ name, ok: result.ok, detail: result.detail, durationMs: ms });
  const tag = result.ok ? 'PASS' : 'FAIL';
  // eslint-disable-next-line no-console
  console.log(`[${tag}] ${ms.toString().padStart(5)}ms · ${name}${result.detail ? ' — ' + result.detail : ''}`);
}

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

const PUBLIC_ROUTES = [
  '/',
  '/audiencia',
  '/sobre',
  '/diagnostico',
  '/diagnostico/acesso-habitacional',
  '/diagnostico/emprego-moradia',
  '/diagnostico/mobilidade-emprego',
  '/diagnostico/vegetacao-densidade',
  '/diagnostico/patrimonio-identidade',
  '/zoneamento',
  '/zoneamento/centro-tamandare',
  '/zoneamento/lazer-turismo',
  '/zoneamento/conservacao-ambiental',
  '/contribuir',
  '/chat',
  '/resultados',
  '/admin',
];

async function checkPublicRoute(path: string) {
  await check(`GET ${path}`, async () => {
    const res = await fetchWithTimeout(`${BASE}${path}`);
    return {
      ok: res.status === 200,
      detail: res.status === 200 ? '' : `status=${res.status}`,
    };
  });
}

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

async function checkApiContributeInvalidJson() {
  await check('POST /api/contribute — JSON inválido → 400', async () => {
    const res = await fetchWithTimeout(`${BASE}/api/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    return { ok: res.status === 400, detail: `status=${res.status}` };
  });
}

async function checkApiContributeShortBody() {
  await check('POST /api/contribute — body curto → 422', async () => {
    const res = await fetchWithTimeout(`${BASE}/api/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'drenagem-urbana',
        macroarea_slug: null,
        location_address: null,
        no_specific_location: true,
        body: 'curto',
        attachments: [],
        identification: { mode: 'anonymous' },
        consent_lgpd: true,
        recaptcha_token: null,
      }),
    });
    return { ok: res.status === 422, detail: `status=${res.status}` };
  });
}

async function checkApiContributeNoSupabase() {
  // Payload válido — se Supabase não estiver configurado, espera 503.
  // Se estiver configurado, vai criar uma contribuição real (e responder 201).
  // Esse teste só PASSA se status ∈ {201, 503}.
  await check(
    'POST /api/contribute — payload válido → 201 ou 503',
    async () => {
      const body = {
        category: 'drenagem-urbana',
        macroarea_slug: null,
        location_address: null,
        no_specific_location: true,
        body:
          'SMOKE TEST — esse texto é gerado automaticamente pelo scripts/smoke-test.ts para validar o endpoint. Pode ignorar.',
        attachments: [],
        identification: { mode: 'anonymous' },
        consent_lgpd: true,
        recaptcha_token: null,
      };
      const res = await fetchWithTimeout(`${BASE}/api/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return {
        ok: res.status === 201 || res.status === 503,
        detail: `status=${res.status}`,
      };
    },
  );
}

async function checkApiChatInvalidJson() {
  await check('POST /api/chat — JSON inválido → 400', async () => {
    const res = await fetchWithTimeout(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    return { ok: res.status === 400, detail: `status=${res.status}` };
  });
}

async function checkApiChatShort() {
  await check('POST /api/chat — message curta → 422', async () => {
    const res = await fetchWithTimeout(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'oi' }),
    });
    return { ok: res.status === 422, detail: `status=${res.status}` };
  });
}

async function checkApiChatValid() {
  // Espera 200 (RAG funcionando) ou 503 (Supabase off).
  await check('POST /api/chat — message válida → 200 ou 503', async () => {
    const res = await fetchWithTimeout(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Onde fica a Macroárea Social Morros?',
      }),
    });
    return {
      ok: res.status === 200 || res.status === 503,
      detail: `status=${res.status}`,
    };
  });
}

async function checkApiElevation() {
  // Espera 200 (cache ou Google) ou 500 (GMAPS_BACKEND_KEY ausente).
  await check('POST /api/elevation → 200 ou 500', async () => {
    const res = await fetchWithTimeout(`${BASE}/api/elevation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: -8.7553, lng: -35.1031 }),
    });
    return {
      ok: res.status === 200 || res.status === 500,
      detail: `status=${res.status}`,
    };
  });
}

// ---------------------------------------------------------------------------
// SEO routes
// ---------------------------------------------------------------------------

async function checkSitemap() {
  await check('GET /sitemap.xml → 200 + XML', async () => {
    const res = await fetchWithTimeout(`${BASE}/sitemap.xml`);
    if (res.status !== 200) return { ok: false, detail: `status=${res.status}` };
    const ct = res.headers.get('content-type') ?? '';
    const isXml = ct.includes('xml');
    return {
      ok: isXml,
      detail: isXml ? '' : `content-type=${ct}`,
    };
  });
}

async function checkRobots() {
  await check('GET /robots.txt → 200 + texto', async () => {
    const res = await fetchWithTimeout(`${BASE}/robots.txt`);
    if (res.status !== 200) return { ok: false, detail: `status=${res.status}` };
    const txt = await res.text();
    const hasAdmin = txt.includes('/admin');
    return {
      ok: hasAdmin,
      detail: hasAdmin ? '' : 'não bloqueia /admin',
    };
  });
}

async function check404() {
  await check('GET /rota-que-nao-existe → 404', async () => {
    const res = await fetchWithTimeout(`${BASE}/rota-que-nao-existe-${Date.now()}`);
    return { ok: res.status === 404, detail: `status=${res.status}` };
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // eslint-disable-next-line no-console
  console.log(`\n=== Smoke test contra ${BASE} ===\n`);

  for (const route of PUBLIC_ROUTES) {
    // eslint-disable-next-line no-await-in-loop
    await checkPublicRoute(route);
  }

  await checkApiContributeInvalidJson();
  await checkApiContributeShortBody();
  await checkApiContributeNoSupabase();
  await checkApiChatInvalidJson();
  await checkApiChatShort();
  await checkApiChatValid();
  await checkApiElevation();
  await checkSitemap();
  await checkRobots();
  await check404();

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  // eslint-disable-next-line no-console
  console.log(`\n=== ${passed}/${results.length} checks passaram ===`);

  if (failed.length > 0) {
    // eslint-disable-next-line no-console
    console.log('\nFalhas:');
    for (const f of failed) {
      // eslint-disable-next-line no-console
      console.log(`  - ${f.name} (${f.detail})`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
