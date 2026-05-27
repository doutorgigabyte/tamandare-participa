import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import {
  findIndicador,
  INDICADOR_SLUGS,
  type IndicadorColor,
  type IndicadorComparison,
} from '@/lib/diagnostico/indicadores';
import { CitationChip } from '@/components/citation-chip';

type PageProps = {
  params: { indicador: string };
};

export function generateStaticParams() {
  return INDICADOR_SLUGS.map((slug) => ({ indicador: slug }));
}

export function generateMetadata({ params }: PageProps) {
  const ind = findIndicador(params.indicador);
  if (!ind) return { title: 'Indicador não encontrado' };
  return {
    title: `${ind.title} — ${ind.big_number}`,
    description: ind.subtitle,
  };
}

const COLOR_BORDER: Record<IndicadorColor, string> = {
  red: 'border-red-900/40',
  amber: 'border-amber-900/40',
  green: 'border-emerald-900/40',
  blue: 'border-sky-900/40',
};

const COLOR_NUMBER: Record<IndicadorColor, string> = {
  red: 'text-red-400',
  amber: 'text-amber-400',
  green: 'text-emerald-400',
  blue: 'text-sky-400',
};

const COLOR_BAR: Record<IndicadorColor, string> = {
  red: 'bg-red-500/70',
  amber: 'bg-amber-500/70',
  green: 'bg-emerald-500/70',
  blue: 'bg-sky-500/70',
};

export default function IndicadorPage({ params }: PageProps) {
  const ind = findIndicador(params.indicador);
  if (!ind) notFound();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/diagnostico"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200"
      >
        <ArrowLeft className="h-3 w-3" />
        Todos os indicadores
      </Link>

      {/* Hero */}
      <header className={`rounded-2xl border-2 ${COLOR_BORDER[ind.color]} p-8`}>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {ind.short_title}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-100 sm:text-3xl">
          {ind.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{ind.subtitle}</p>

        <div className="mt-6 flex items-baseline gap-3">
          <span
            className={`font-mono text-7xl font-bold tracking-tight sm:text-8xl ${COLOR_NUMBER[ind.color]}`}
          >
            {ind.big_number}
          </span>
          {ind.big_number_unit && (
            <span className="text-base text-zinc-500">{ind.big_number_unit}</span>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-zinc-300">
          {ind.ranking_label}
        </p>
      </header>

      {/* Plain language */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-100">
          O que esse número significa
        </h2>
        <p className="mt-3 text-base leading-relaxed text-zinc-300">
          {ind.plain_language}
        </p>
      </section>

      {/* Comparison bars */}
      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {ind.comparison.title}
        </h3>
        <ComparisonBars
          items={ind.comparison.items}
          higherIsBetter={ind.comparison.higherIsBetter}
          color={ind.color}
          unit={ind.comparison.unit ?? ind.big_number_unit}
        />
      </section>

      {/* Plano implications */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-100">
          O que isso significa pro Plano Diretor
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-base text-zinc-300">
          {ind.plano_meaning.map((bullet, idx) => (
            <li key={idx} className="flex gap-3">
              <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <CitationChip source={ind.citation.source} page={ind.citation.page} />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 rounded-2xl border border-primary/40 bg-primary/5 p-6">
        <div className="flex items-start gap-3">
          <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-100">
              Tem algo a dizer sobre {ind.short_title.toLowerCase()} em Tamandaré?
            </h3>
            <p className="mt-1 text-sm text-zinc-300">
              Sua contribuição entra no relatório consolidado que vai pra
              Prefeitura. Tem até <strong>31/05/2026</strong>.
            </p>
            <Link
              href={{
                pathname: '/contribuir',
                query: {
                  category: ind.related_category,
                  from_diagnostico: ind.slug,
                },
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Contribuir sobre {ind.short_title}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ComparisonBars({
  items,
  higherIsBetter,
  color,
  unit,
}: {
  items: IndicadorComparison[];
  higherIsBetter: boolean;
  color: IndicadorColor;
  unit?: string;
}) {
  const maxValue = Math.max(...items.map((i) => i.value));
  return (
    <div className="mt-4 flex flex-col gap-3">
      {items.map((item) => {
        const widthPct = (item.value / maxValue) * 100;
        const isCurrent = item.isCurrent === true;
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span
                className={
                  isCurrent ? 'font-semibold text-zinc-100' : 'text-zinc-400'
                }
              >
                {item.label}
              </span>
              <span
                className={`font-mono ${isCurrent ? `font-semibold ${COLOR_NUMBER[color]}` : 'text-zinc-500'}`}
              >
                {formatValue(item.value, unit)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
              <div
                className={`h-full rounded-full transition-all ${isCurrent ? COLOR_BAR[color] : 'bg-zinc-700'}`}
                style={{ width: `${widthPct}%` }}
                aria-hidden
              />
            </div>
          </div>
        );
      })}
      <p className="mt-2 text-xs text-zinc-500">
        {higherIsBetter ? 'Maior é melhor.' : 'Menor é melhor.'}
      </p>
    </div>
  );
}

function formatValue(value: number, unit?: string): string {
  if (unit === '%') return `${value}%`;
  if (value < 10) {
    return value.toFixed(2).replace('.', ',');
  }
  return value.toLocaleString('pt-BR');
}
