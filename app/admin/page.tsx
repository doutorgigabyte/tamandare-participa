import { redirect } from 'next/navigation';
import {
  isAdminAuthed,
  isAdminConfigured,
} from '@/lib/admin/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { ModerationQueue } from './_components/moderation-queue';
import { LoginForm } from './_components/login-form';

export const metadata = { title: 'Admin — Moderação' };
export const dynamic = 'force-dynamic';

type SearchParams = {
  login_error?: string;
  status?: string;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!isAdminConfigured()) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Admin desabilitado</h1>
        <p className="mt-4 text-zinc-300">
          Pra ativar o painel de moderação, defina{' '}
          <code className="font-mono text-primary">ADMIN_TOKEN</code> em{' '}
          <code className="font-mono">.env.local</code>. Gere com:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
{`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`}
        </pre>
      </main>
    );
  }

  if (!isAdminAuthed()) {
    return <LoginForm errorCode={searchParams.login_error} />;
  }

  // Autenticado — busca contribuições pra moderar
  const filterStatus = searchParams.status ?? 'pending';
  const validStatuses = ['pending', 'published', 'flagged', 'spam', 'all'];
  const status = validStatuses.includes(filterStatus) ? filterStatus : 'pending';

  const supabase = createServiceClient();
  let query = supabase
    .from('contributions')
    .select(
      'id, category, macroarea_slug, body, status, is_anonymous, moderator_notes, hash_integrity, location_address, created_at, published_at',
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: contributions, error } = await query;

  if (error) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <div className="mt-6 rounded-lg border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-300">
          Erro ao carregar contribuições: {error.message}.
          {' '}Supabase pode não estar configurado — confira <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>SUPABASE_SERVICE_ROLE_KEY</code>.
        </div>
      </main>
    );
  }

  // Contagens pra header
  const counts = await getCounts(supabase);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-500">
            Moderação
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Fila de contribuições
          </h1>
        </div>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="text-xs text-zinc-400 hover:text-zinc-100"
          >
            Sair
          </button>
        </form>
      </header>

      <CountBadges counts={counts} currentStatus={status} />

      <ModerationQueue contributions={contributions ?? []} />
    </main>
  );
}

async function getCounts(
  supabase: ReturnType<typeof createServiceClient>,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('contributions')
    .select('status', { count: 'exact', head: false });
  if (error || !data) return {};
  const out: Record<string, number> = { all: data.length };
  for (const row of data) {
    out[row.status] = (out[row.status] ?? 0) + 1;
  }
  return out;
}

function CountBadges({
  counts,
  currentStatus,
}: {
  counts: Record<string, number>;
  currentStatus: string;
}) {
  const filters = [
    { slug: 'pending', label: 'Aguardando moderação' },
    { slug: 'published', label: 'Publicadas' },
    { slug: 'flagged', label: 'Sinalizadas' },
    { slug: 'spam', label: 'Spam' },
    { slug: 'all', label: 'Todas' },
  ];
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {filters.map((f) => {
        const isActive = currentStatus === f.slug;
        const count = counts[f.slug] ?? 0;
        return (
          <a
            key={f.slug}
            href={`/admin?status=${f.slug}`}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              isActive
                ? 'border-primary/60 bg-primary/15 text-primary'
                : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {f.label} <span className="font-mono">({count})</span>
          </a>
        );
      })}
    </nav>
  );
}
