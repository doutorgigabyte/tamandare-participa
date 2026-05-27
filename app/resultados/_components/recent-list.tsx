import { CATEGORY_CONFIG } from '@/lib/contribution/categories';
import macroareasSeed from '@/db/seed/macroareas.example.json';
import type { ContributionListItem } from '@/lib/resultados/fetch';

type MacroareaConfig = { slug: string; name: string; display_color: string };

const CATEGORY_MAP = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.slug, c]),
);
const MACROAREA_MAP = Object.fromEntries(
  (macroareasSeed.macroareas as MacroareaConfig[]).map((m) => [m.slug, m]),
);

const SNIPPET_LEN = 260;

type Props = {
  items: ContributionListItem[];
};

export function RecentList({ items }: Props) {
  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 text-sm text-zinc-500">
        Nenhuma contribuição publicada ainda.
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Contribuições recentes
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((c) => {
          const cat = CATEGORY_MAP[c.category];
          const macro = c.macroarea_slug
            ? MACROAREA_MAP[c.macroarea_slug]
            : null;
          const Icon = cat?.icon;
          const snippet =
            c.body.length > SNIPPET_LEN
              ? c.body.slice(0, SNIPPET_LEN) + '…'
              : c.body;
          return (
            <article
              key={c.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <header className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                {cat && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300">
                    {Icon && <Icon className="h-3 w-3" aria-hidden />}
                    {cat.label}
                  </span>
                )}
                {macro && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-300"
                    style={{
                      backgroundColor: `${macro.display_color}22`,
                      borderColor: `${macro.display_color}55`,
                    }}
                  >
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: macro.display_color }}
                    />
                    {macro.name.replace(/^(?:Macroárea|Zona Especial) (?:de |dos? |Centro )?/, '')}
                  </span>
                )}
                {c.status === 'pending' && (
                  <span className="rounded-full border border-amber-900/60 bg-amber-950/40 px-2 py-0.5 text-amber-300">
                    Em moderação
                  </span>
                )}
                <span className="ml-auto text-zinc-500">{timeAgo(c.created_at)}</span>
              </header>
              <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
                {snippet}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  if (seconds < 60) return formatter.format(-seconds, 'second');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return formatter.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  return formatter.format(-days, 'day');
}
