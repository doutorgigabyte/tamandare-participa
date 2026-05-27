import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INDICADORES, type IndicadorColor } from '@/lib/diagnostico/indicadores';

export const metadata = {
  title: 'Diagnóstico — 5 indicadores de Tamandaré',
  description:
    'Como Tamandaré se compara com o Brasil em habitação, emprego, mobilidade, vegetação e patrimônio. Diagnóstico do Instituto Cidades Responsivas.',
};

const COLOR_BG: Record<IndicadorColor, string> = {
  red: 'border-red-900/50 bg-atlantico-terracota-clara/20',
  amber: 'border-amber-900/50 bg-amber-950/30',
  green: 'border-emerald-900/50 bg-emerald-950/30',
  blue: 'border-sky-900/50 bg-sky-950/30',
};

const COLOR_NUMBER: Record<IndicadorColor, string> = {
  red: 'text-atlantico-terracota',
  amber: 'text-amber-400',
  green: 'text-emerald-400',
  blue: 'text-sky-400',
};

export default function DiagnosticoIndex() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10 max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Diagnóstico — Instituto Cidades Responsivas
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Como Tamandaré se compara com o Brasil
        </h1>
        <p className="mt-4 text-base text-foreground/90">
          Cinco indicadores calculados pelo Instituto Cidades Responsivas com
          dados de Censo, Ministério do Trabalho, Landsat 8 e API do Flickr.
          Cada um deles ajuda a entender uma decisão diferente do novo Plano
          Diretor. Clica num indicador pra ver o detalhe e enviar uma
          contribuição.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {INDICADORES.map((ind) => (
          <Link
            key={ind.slug}
            href={`/diagnostico/${ind.slug}`}
            className={`group rounded-xl border ${COLOR_BG[ind.color]} p-6 transition-all hover:scale-[1.01] hover:shadow-lg`}
          >
            <div className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
              {ind.short_title}
            </div>
            <div className="mb-2 flex items-baseline gap-2">
              <span
                className={`font-mono text-5xl font-bold tracking-tight ${COLOR_NUMBER[ind.color]}`}
              >
                {ind.big_number}
              </span>
              {ind.big_number_unit && (
                <span className="text-sm text-muted-foreground">{ind.big_number_unit}</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-foreground">{ind.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{ind.subtitle}</p>
            <p className="mt-3 text-xs text-muted-foreground">{ind.ranking_label}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary transition-opacity group-hover:opacity-100">
              Ver detalhe e contribuir
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        Fonte: Caderno &quot;Análise Preliminar do Plano Diretor municipal de
        Tamandaré/PE&quot; — Instituto Cidades Responsivas (2026). Páginas 26-52.
      </footer>
    </main>
  );
}
