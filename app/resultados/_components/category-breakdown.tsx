import { CATEGORY_CONFIG } from '@/lib/contribution/categories';
import type { Aggregates } from '@/lib/resultados/fetch';

type Props = {
  agg: Aggregates;
};

export function CategoryBreakdown({ agg }: Props) {
  const rows = CATEGORY_CONFIG.map((c) => ({
    slug: c.slug,
    label: c.label,
    Icon: c.icon,
    count: agg.by_category[c.slug] ?? 0,
  }));

  rows.sort((a, b) => b.count - a.count);

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <section className="rounded-xl border border-border bg-muted/40 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Contribuições por categoria
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        {rows.map((r) => {
          const pct = (r.count / max) * 100;
          const Icon = r.Icon;
          return (
            <div key={r.slug}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground/90">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {r.label}
                </span>
                <span className="font-mono text-muted-foreground">{r.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-card">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all"
                  style={{ width: `${pct}%` }}
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
