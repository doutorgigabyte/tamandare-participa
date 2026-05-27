import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, AlertTriangle, FileText, MapPin } from 'lucide-react';
import {
  findMacroarea,
  MACROAREA_SLUGS,
} from '@/lib/zoneamento/macroareas';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return MACROAREA_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps) {
  const m = findMacroarea(params.slug);
  if (!m) return { title: 'Macroárea não encontrada' };
  return {
    title: m.name,
    description: m.description_plain,
  };
}

export default function MacroareaPage({ params }: PageProps) {
  const m = findMacroarea(params.slug);
  if (!m) notFound();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/zoneamento"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200"
      >
        <ArrowLeft className="h-3 w-3" />
        Todas as macroáreas
      </Link>

      {/* Hero colorido */}
      <header
        className="rounded-2xl border-2 p-8"
        style={{
          borderColor: `${m.display_color}66`,
          backgroundColor: `${m.display_color}10`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-block h-4 w-4 rounded-full"
            style={{ backgroundColor: m.display_color }}
          />
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Macroárea
          </p>
        </div>
        <h1
          className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: m.display_color }}
        >
          {m.name}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-200">
          {m.description_plain}
        </p>
      </header>

      {/* Descrição oficial */}
      {!isPlaceholder(m.description_official) && (
        <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
            <FileText className="h-3 w-3" />
            Texto oficial — Circular 001-2026
          </div>
          <p className="text-sm leading-relaxed text-zinc-300">
            {m.description_official}
          </p>
        </section>
      )}

      {/* O que muda */}
      {!isPlaceholder(m.changes_from_current) && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-100">
            O que muda em relação ao Plano de 2002
          </h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-300">
            {m.changes_from_current}
          </p>
        </section>
      )}

      {/* Pontos de atenção */}
      {m.attention_points.length > 0 && (
        <section className="mt-8 rounded-xl border border-amber-900/30 bg-amber-950/20 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Pontos de atenção
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-amber-100">
            {m.attention_points.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Aviso de dados */}
      {(isPlaceholder(m.description_official) || isPlaceholder(m.changes_from_current)) && (
        <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-xs text-zinc-500">
          <strong className="text-zinc-300">Conteúdo em complementação:</strong>{' '}
          o texto literal da Circular 001-2026 pra esta macroárea ainda está
          sendo digitalizado. Pra ler agora, baixe o documento original no{' '}
          <a
            href="https://tamandare.pe.gov.br/plano-diretor-de-2026/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            portal oficial da Prefeitura
          </a>
          .
        </section>
      )}

      {/* CTA */}
      <section className="mt-10 rounded-2xl border border-primary/40 bg-primary/5 p-6">
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-100">
              Quer dizer algo sobre esta macroárea?
            </h3>
            <p className="mt-1 text-sm text-zinc-300">
              Mora aqui, trabalha aqui, frequenta aqui — sua contribuição
              entra no relatório oficial que vai pra Prefeitura.
            </p>
            <Link
              href={{
                pathname: '/contribuir',
                query: { from_macroarea: m.slug },
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Contribuir sobre {shortName(m.name)}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function isPlaceholder(s: string): boolean {
  return !s || s.startsWith('TODO');
}

function shortName(full: string): string {
  return full.replace(/^(?:Macroárea|Zona Especial) (?:de |dos? |Centro )?/, '');
}
