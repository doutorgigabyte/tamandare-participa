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
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Todas as macroáreas
      </Link>

      {/* Hero colorido */}
      <header
        className="rounded-2xl border-2 p-8 shadow-soft"
        style={{
          borderColor: `${m.display_color}88`,
          backgroundColor: `${m.display_color}18`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-block h-4 w-4 rounded-full"
            style={{ backgroundColor: m.display_color }}
          />
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/70">
            Macroárea
          </p>
        </div>
        <h1
          className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
          style={{ color: darken(m.display_color) }}
        >
          {m.name}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-foreground">
          {m.description_plain}
        </p>
      </header>

      {/* Descrição oficial */}
      {!isPlaceholder(m.description_official) && (
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-atlantico-mar-profundo">
            <FileText className="h-3.5 w-3.5" />
            Texto oficial — Circular 001-2026
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
            {m.description_official}
          </p>
        </section>
      )}

      {/* O que muda */}
      {!isPlaceholder(m.changes_from_current) && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            O que muda em relação ao Plano de 2002
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/90">
            {m.changes_from_current}
          </p>
        </section>
      )}

      {/* Pontos de atenção */}
      {m.attention_points.length > 0 && (
        <section className="mt-8 rounded-xl border border-atlantico-terracota/30 bg-atlantico-terracota-clara/20 p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-atlantico-terracota sm:text-xl">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Pontos de atenção
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-foreground/90">
            {m.attention_points.map((p) => (
              <li key={p} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-atlantico-terracota"
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Aviso de dados */}
      {(isPlaceholder(m.description_official)
        || isPlaceholder(m.changes_from_current)) && (
        <section className="mt-8 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">
            Conteúdo em complementação:
          </strong>{' '}
          o texto literal da Circular 001-2026 pra esta macroárea ainda está
          sendo organizado. Pra ler agora, baixe o documento na{' '}
          <Link
            href="/legislacao/circular"
            className="font-medium text-atlantico-mar-profundo hover:underline"
          >
            página da Circular
          </Link>{' '}
          aqui na plataforma.
        </section>
      )}

      {/* CTA */}
      <section className="mt-10 rounded-2xl border border-atlantico-mata-clara/60 bg-atlantico-mata-clara/20 p-6">
        <div className="flex items-start gap-3">
          <MapPin
            className="mt-1 h-5 w-5 shrink-0 text-atlantico-mata-atlantica"
            aria-hidden
          />
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold leading-tight text-foreground sm:text-xl">
              Quer dizer algo sobre esta macroárea?
            </h3>
            <p className="mt-2 text-sm text-foreground/85 sm:text-base">
              Mora aqui, trabalha aqui, frequenta aqui — sua contribuição
              fica pública em{' '}
              <Link
                href="/contribuicoes"
                className="font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline"
              >
                /contribuicoes
              </Link>{' '}
              e entra no documento independente que será protocolado.
            </p>
            <Link
              href={{
                pathname: '/contribuir',
                query: { from_macroarea: m.slug },
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-atlantico-mata-atlantica px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:opacity-90"
            >
              Contribuir sobre {shortName(m.name)}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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

// Escurece o hex pra usar como cor de texto sobre fundo claro (contraste WCAG)
function darken(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  let r = (n >> 16) & 0xff;
  let g = (n >> 8) & 0xff;
  let b = n & 0xff;
  const factor = 0.55; // 55% da cor original → mais escuro
  r = Math.round(r * factor);
  g = Math.round(g * factor);
  b = Math.round(b * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
