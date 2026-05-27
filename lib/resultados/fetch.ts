/**
 * Server-only: busca + agrega dados pra /resultados.
 *
 * Retorna null quando Supabase não está configurado — a page mostra
 * empty state amigável em vez de quebrar.
 *
 * MVP 1: inclui status pending + published (exclui spam/flagged) porque
 * o moderation UI não existe ainda e queremos o dashboard com vida desde
 * a primeira submissão.
 */

import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

export type AttachmentPublic = {
  name: string;
  size: number;
  type: string;
  /** URL pública se já há upload real; null no MVP 1 (stub). */
  url?: string | null;
};

export type ContributionListItem = {
  id: string;
  /** Primeiro nome de quem se identificou (público). Null quando anônimo. */
  display_name: string | null;
  category: string;
  macroarea_slug: string | null;
  location_address: string | null;
  body: string;
  /** URL pública do áudio original (transparência total). Null se foi texto. */
  audio_url: string | null;
  attachments: AttachmentPublic[];
  status: 'pending' | 'published' | 'flagged' | 'spam';
  is_anonymous: boolean;
  created_at: string;
  /** Hash de integridade truncado pra exibir como "ID público". */
  hash_short: string | null;
};

export type Aggregates = {
  total: number;
  pending_count: number;
  published_count: number;
  by_macroarea: Record<string, number>; // slug → count
  by_category: Record<string, number>; // category → count
  recent: ContributionListItem[];
  last_updated: string; // ISO timestamp da agregação
};

const VISIBLE_STATUSES = ['pending', 'published'] as const;
const RECENT_LIMIT = 12;

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

export async function getAggregates(): Promise<Aggregates | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();

  // Busca tudo em paralelo
  const [allRes, recentRes] = await Promise.all([
    supabase
      .from('contributions')
      .select('category, macroarea_slug, status')
      .in('status', VISIBLE_STATUSES as unknown as string[]),
    supabase
      .from('contributions')
      .select(
        'id, display_name, category, macroarea_slug, location_address, body, audio_url, attachments, status, is_anonymous, hash_integrity, created_at',
      )
      .in('status', VISIBLE_STATUSES as unknown as string[])
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT),
  ]);

  if (allRes.error) {
    // eslint-disable-next-line no-console
    console.error('[resultados] erro ao buscar agregados:', allRes.error);
    return null;
  }

  const rows = allRes.data ?? [];

  const by_macroarea: Record<string, number> = {};
  const by_category: Record<string, number> = {};
  let pending_count = 0;
  let published_count = 0;

  for (const row of rows) {
    if (row.status === 'pending') pending_count++;
    else if (row.status === 'published') published_count++;

    const slug = row.macroarea_slug ?? '__none__';
    by_macroarea[slug] = (by_macroarea[slug] ?? 0) + 1;

    const cat = row.category;
    if (cat) by_category[cat] = (by_category[cat] ?? 0) + 1;
  }

  return {
    total: rows.length,
    pending_count,
    published_count,
    by_macroarea,
    by_category,
    recent: normalizeRows(recentRes.data ?? []),
    last_updated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Lista pública paginada — usada por /contribuicoes
// ---------------------------------------------------------------------------

const PAGE_SIZE_DEFAULT = 20;

export type PublicListResult = {
  items: ContributionListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getPublishedContributions(
  options: { page?: number; pageSize?: number; category?: string; macroareaSlug?: string } = {},
): Promise<PublicListResult | null> {
  if (!isSupabaseConfigured()) return null;
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, options.pageSize ?? PAGE_SIZE_DEFAULT));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createServiceClient();
  let query = supabase
    .from('contributions')
    .select(
      'id, display_name, category, macroarea_slug, location_address, body, audio_url, attachments, status, is_anonymous, hash_integrity, created_at',
      { count: 'exact' },
    )
    .in('status', VISIBLE_STATUSES as unknown as string[])
    .order('created_at', { ascending: false })
    .range(from, to);

  if (options.category) query = query.eq('category', options.category);
  if (options.macroareaSlug) query = query.eq('macroarea_slug', options.macroareaSlug);

  const { data, count, error } = await query;
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[contribuicoes] query falhou:', error);
    return null;
  }

  return {
    items: normalizeRows(data ?? []),
    total: count ?? 0,
    page,
    pageSize,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeRows(rows: unknown[]): ContributionListItem[] {
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    const hash = row.hash_integrity as string | null;
    return {
      id: row.id as string,
      display_name: (row.display_name as string | null) ?? null,
      category: row.category as string,
      macroarea_slug: (row.macroarea_slug as string | null) ?? null,
      location_address: (row.location_address as string | null) ?? null,
      body: row.body as string,
      audio_url: (row.audio_url as string | null) ?? null,
      attachments: normalizeAttachments(row.attachments),
      status: row.status as ContributionListItem['status'],
      is_anonymous: Boolean(row.is_anonymous),
      created_at: row.created_at as string,
      hash_short: hash ? hash.slice(0, 12) : null,
    };
  });
}

function normalizeAttachments(raw: unknown): AttachmentPublic[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a): a is Record<string, unknown> => typeof a === 'object' && a !== null)
    .map((a) => ({
      name: String(a.name ?? ''),
      size: Number(a.size ?? 0),
      type: String(a.type ?? ''),
      url: (a.url as string | undefined) ?? (a.storage_path ? String(a.storage_path) : null),
    }))
    .filter((a) => a.name.length > 0);
}
