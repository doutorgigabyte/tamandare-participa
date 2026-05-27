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

export type ContributionListItem = {
  id: string;
  category: string;
  macroarea_slug: string | null;
  body: string;
  status: 'pending' | 'published' | 'flagged' | 'spam';
  is_anonymous: boolean;
  created_at: string;
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
        'id, category, macroarea_slug, body, status, is_anonymous, created_at',
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
    recent: (recentRes.data ?? []) as ContributionListItem[],
    last_updated: new Date().toISOString(),
  };
}
