import type { Aggregates } from '@/lib/resultados/fetch';

type Props = {
  agg: Aggregates;
};

export function StatCards({ agg }: Props) {
  const macroareasCovered = Object.keys(agg.by_macroarea).filter(
    (k) => k !== '__none__' && agg.by_macroarea[k] > 0,
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total de contribuições"
        value={agg.total.toLocaleString('pt-BR')}
        hint={
          agg.pending_count > 0
            ? `${agg.pending_count} aguardando moderação`
            : 'Tudo já moderado'
        }
      />
      <StatCard
        label="Macroáreas cobertas"
        value={`${macroareasCovered}/10`}
        hint={macroareasCovered < 10 ? 'Faltam algumas zonas' : 'Cobertura total'}
      />
      <StatCard
        label="Última atualização"
        value={formatTime(agg.last_updated)}
        hint="Atualiza a cada 30 segundos"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
