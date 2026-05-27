import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ContributionCard } from '@/components/contribution-card';
import type { ContributionListItem } from '@/lib/resultados/fetch';

type Props = {
  items: ContributionListItem[];
};

export function RecentList({ items }: Props) {
  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
        Nenhuma contribuição publicada ainda.
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contribuições recentes
        </h2>
        <Link
          href="/contribuicoes"
          className="inline-flex items-center gap-1 text-sm font-medium text-atlantico-mar-profundo hover:underline"
        >
          Ver todas
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((c) => (
          <ContributionCard key={c.id} item={c} compact />
        ))}
      </div>
    </section>
  );
}
