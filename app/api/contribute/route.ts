import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import {
  contributionPayloadSchema,
  formatZodErrors,
} from '@/lib/contribution/schema';
import { computeIntegrityHash, hashCpf } from '@/lib/contribution/hash';
import { uploadAttachments } from '@/lib/storage/upload';
import { assessAction } from '@/lib/recaptcha/verify';
import { gateway } from '@/lib/gateway/client';
import { createServiceClient } from '@/lib/supabase/server';
import type { ContributionError } from '@/lib/contribution/types';

/**
 * POST /api/contribute
 * PRD v1.0 §5.5 + §11.3 + adendo v1.1 §1.4.
 *
 * Fluxo:
 *   1. Parse JSON + valida com Zod (422 se inválido).
 *   2. assessAction() do reCAPTCHA Enterprise (bypass dev se env ausente).
 *      Score < 0.3 → 429.
 *   3. Se location_address presente → gateway.maps.geocode() pra resolver
 *      lat/lng. Falha de geocode não é fatal (segue sem location).
 *   4. Persiste anexos via stub (metadata-only no MVP 1).
 *   5. Hash do CPF (se identificado e com CPF) + hash de integridade.
 *   6. 503 se Supabase não configurado (deixa front mostrar mensagem amigável).
 *   7. Insert em `contributions` com status pending.
 *   8. 201 com { id, hash_short, status }.
 */

const RECAPTCHA_REJECT_THRESHOLD = 0.3;
// PRD §11.3: "pode liberar auto-publish após confiança". score >= 0.7 indica
// alta confiança no usuário (reCAPTCHA Enterprise) — vai direto pra 'published'.
// Os outros (entre 0.3 e 0.7) seguem como 'pending' pra moderação humana.
const AUTO_PUBLISH_THRESHOLD = 0.7;

export const runtime = 'nodejs'; // crypto.createHash (node:crypto) precisa de Node, não Edge.
export const dynamic = 'force-dynamic';

function errorResponse(
  body: ContributionError,
  status: number,
): NextResponse<ContributionError> {
  return NextResponse.json(body, { status });
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url
      && key
      && !url.includes('your-project')
      && !key.includes('REPLACE-ME'),
  );
}

export async function POST(req: NextRequest) {
  // ---------------------------------------------------------------------------
  // 1. Parse + validação
  // ---------------------------------------------------------------------------
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return errorResponse(
      { error: 'invalid_json', detail: 'Corpo da requisição não é JSON válido.' },
      400,
    );
  }

  let payload;
  try {
    payload = contributionPayloadSchema.parse(rawBody);
  } catch (err) {
    if (err instanceof ZodError) {
      return errorResponse(
        {
          error: 'validation_failed',
          detail: 'Verifique os campos destacados.',
          field_errors: formatZodErrors(err),
        },
        422,
      );
    }
    throw err;
  }

  // ---------------------------------------------------------------------------
  // 2. reCAPTCHA
  // ---------------------------------------------------------------------------
  const assessment = await assessAction(payload.recaptcha_token, 'contribute_submit');
  if (!assessment.valid || assessment.score < RECAPTCHA_REJECT_THRESHOLD) {
    return errorResponse(
      {
        error: 'suspicious_activity',
        detail:
          'Detectamos atividade suspeita. Recarregue a página e tente novamente.',
      },
      429,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Geocoding (best-effort)
  // ---------------------------------------------------------------------------
  let lat: number | null = null;
  let lng: number | null = null;
  const addressToGeocode = !payload.no_specific_location
    && payload.location_address
    && payload.location_address.trim().length > 0
    ? payload.location_address.trim()
    : null;

  if (addressToGeocode) {
    try {
      // gateway.maps.geocode já tem fallback embutido pra SDK direto.
      // Acrescenta ", Tamandaré, PE, Brasil" só se o cidadão não digitou cidade.
      const enriched = /tamandar[eé]/i.test(addressToGeocode)
        ? addressToGeocode
        : `${addressToGeocode}, Tamandaré, PE, Brasil`;
      const results = await gateway.maps.geocode(enriched);
      if (results.length > 0) {
        lat = results[0].lat;
        lng = results[0].lng;
      }
    } catch (err) {
      // Geocode falhou (Gateway off + sem GMAPS_BACKEND_KEY).
      // Não é fatal — contribuição entra sem location, moderadora vê o endereço.
      // eslint-disable-next-line no-console
      console.warn('[contribute] geocode falhou:', (err as Error).message);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Anexos (stub MVP 1)
  // ---------------------------------------------------------------------------
  const persistedAttachments = await uploadAttachments(payload.attachments);

  // ---------------------------------------------------------------------------
  // 5. Hashes
  // ---------------------------------------------------------------------------
  const isAnonymous = payload.identification.mode === 'anonymous';
  let cpfHash: string | null = null;
  if (payload.identification.mode === 'identified' && payload.identification.cpf) {
    try {
      cpfHash = hashCpf(payload.identification.cpf);
    } catch (err) {
      // CPF_HASH_SALT ausente — recusa-se a hashear pra não vazar CPF cru por engano.
      // eslint-disable-next-line no-console
      console.error('[contribute] CPF_HASH_SALT ausente:', (err as Error).message);
      return errorResponse(
        {
          error: 'infra_pending',
          detail:
            'Tratamento de CPF temporariamente indisponível. Contribua sem CPF ou tente novamente em breve.',
        },
        503,
      );
    }
  }

  const createdAtIso = new Date().toISOString();
  const hashIntegrity = computeIntegrityHash({
    body: payload.body,
    isoTimestamp: createdAtIso,
    // user_id real só quando Auth estiver wired — anonymous como placeholder
    // determinístico até lá. Não usar email aqui: o hash ficaria irreproduzível
    // por terceiros sem o salt.
    userId: null,
  });

  // ---------------------------------------------------------------------------
  // 6. Supabase guard
  // ---------------------------------------------------------------------------
  if (!isSupabaseConfigured()) {
    return errorResponse(
      {
        error: 'infra_pending',
        detail:
          'Banco de dados ainda não configurado. A plataforma estará 100% operacional em breve — guarde sua contribuição.',
      },
      503,
    );
  }

  // ---------------------------------------------------------------------------
  // 7. Insert
  // ---------------------------------------------------------------------------
  // PostGIS espera WKT no formato POINT(lng lat) (long primeiro!).
  const locationWkt = lat !== null && lng !== null ? `POINT(${lng} ${lat})` : null;

  const moderatorNotes = [
    `recaptcha_score=${assessment.score.toFixed(2)}`,
    assessment.bypassed ? 'recaptcha_bypassed=true' : null,
    assessment.reasons?.length ? `reasons=${assessment.reasons.join(',')}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  // Auto-publish quando reCAPTCHA score >= 0.7 — PRD §11.3.
  // Bypass (score=1 em dev sem RECAPTCHA_SECRET_KEY) também conta como published
  // pra dev experience, mas em prod só passa pelo Enterprise real.
  const autoPublish = assessment.score >= AUTO_PUBLISH_THRESHOLD;
  const finalStatus: 'pending' | 'published' = autoPublish ? 'published' : 'pending';

  const insertRow = {
    user_id: null, // MVP 1: sem Auth — sempre null
    is_anonymous: isAnonymous,
    category: payload.category,
    macroarea_slug: payload.macroarea_slug,
    location: locationWkt, // PostGIS aceita WKT em colunas geography
    location_address: payload.location_address?.trim() || null,
    body: payload.body.trim(),
    sentiment: null,
    attachments: persistedAttachments,
    status: finalStatus,
    published_at: autoPublish ? createdAtIso : null,
    moderator_notes: moderatorNotes || null,
    hash_integrity: hashIntegrity,
    created_at: createdAtIso,
    // cpf_hash NÃO está em contributions no schema atual — vai pra profiles quando
    // Auth existir. Por enquanto, persiste no moderator_notes só pra moderadora
    // saber que veio com CPF (sem expor o hash):
  };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('contributions')
    .insert({
      ...insertRow,
      moderator_notes: cpfHash
        ? `${moderatorNotes} cpf_hash_present=true`
        : moderatorNotes || null,
    })
    .select('id, created_at')
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[contribute] insert falhou:', error);
    return errorResponse(
      {
        error: 'db_error',
        detail:
          'Falha ao salvar sua contribuição. Tente novamente em instantes.',
      },
      500,
    );
  }

  return NextResponse.json(
    {
      id: data.id,
      hash_short: hashIntegrity.slice(0, 12),
      hash_full: hashIntegrity,
      status: finalStatus,
      created_at: data.created_at,
    },
    { status: 201 },
  );
}
