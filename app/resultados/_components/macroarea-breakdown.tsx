import macroareasSeed from '@/db/seed/macroareas.example.json';
import type { Aggregates } from '@/lib/resultados/fetch';

type MacroareaConfig = {
  slug: string;
  name: string;
  display_color: string;
};

const MACROAREAS = (macroareasSeed.macroareas as MacroareaConfig[]).map((m) => ({
  slug: m.slug,
  name: m.name,
  color: m.display_color,
}));

type Props = {
  agg: Aggregates;
};

export function MacroareaBreakdown({ agg }: Props) {
  // Inclui as 10 macroáreas + um eventual bucket "sem macroárea" se houver
  const rows = MACROAREAS.map((m) => ({
    slug: m.slug,
    name: m.name,
    color: m.color,
    count: agg.by_macroarea[m.slug] ?? 0,
  }));

  const noneCount = agg.by_macroarea['__none__'] ?? 0;
  if (noneCount > 0) {
    rows.push({
      slug: '__none__',
      name: 'Sem macroárea específica',
      color: '#52525b',
      count: noneCount,
    });
  }

  // Ordena do mais contribuído pro menos
  rows.sort((a, b) => b.count - a.count);

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Contribuições por macroárea
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        {rows.map((r) => {
          const pct = (r.count / max) * 100;
          return (
            <div key={r.slug}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-300">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  {r.name}
                </span>
                <span className="font-mono text-zinc-400">{r.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: r.count > 0 ? r.color : 'transparent',
                  }}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
