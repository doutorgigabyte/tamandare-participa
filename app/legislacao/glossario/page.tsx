import Link from 'next/link';
import { ArrowLeft, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  type GlossaryTerm,
} from '@/lib/docs/glossary';
import { DOCUMENTS, pdfPageUrl } from '@/lib/docs/sources';

export const metadata = {
  title: 'Glossário urbanístico',
  description:
    'Gabarito, taxa de ocupação, coeficiente, recuo, ZEIS, outorga onerosa e outros termos do Plano Diretor de Tamandaré explicados em português claro.',
};

export default function GlossarioPage() {
  // Agrupa termos por categoria
  const byCategory = GLOSSARY_CATEGORIES.map((cat) => ({
    ...cat,
    terms: GLOSSARY.filter((t) => t.category === cat.id).sort((a, b) =>
      a.term.localeCompare(b.term, 'pt-BR'),
    ),
  })).filter((c) => c.terms.length > 0);

  return (
    <main className="flex min-h-screen flex-col">
      {/* HEADER */}
      <section className="bg-praia-gradient border-b border-border">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/legislacao"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Legislação
            </Link>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-atlantico-mar-raso/20 text-atlantico-mar-profundo">
                <BookOpen className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-atlantico-mar-profundo">
                  Glossário
                </p>
                <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Termos do Plano Diretor, em português claro
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Você não precisa ser arquiteto ou advogado pra entender o
                  Plano. Aqui está o significado dos {GLOSSARY.length} termos
                  mais importantes — com exemplo e link pras páginas do estudo
                  oficial onde cada um aparece.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÍNDICE RÁPIDO */}
      <section className="container mx-auto border-b border-border px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Pular pra categoria
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {byCategory.map((c) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-atlantico-mar-raso/40 hover:bg-muted/50"
              >
                {c.label}{' '}
                <span className="text-muted-foreground">
                  · {c.terms.length}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {byCategory.map((cat) => (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-20">
              <header className="mb-5 border-b border-border pb-3">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {cat.label}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cat.description}
                </p>
              </header>
              <dl className="space-y-4">
                {cat.terms.map((term) => (
                  <TermCard key={term.slug} term={term} />
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-atlantico-mata-clara/60 bg-atlantico-mata-clara/20 p-6 sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mata-atlantica">
            Faltou algum termo?
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
            Conta pra gente. A próxima cidadã agradece.
          </h3>
          <p className="mt-2 text-sm text-foreground/80">
            Mande sugestão de termo (com exemplo do contexto onde apareceu) via{' '}
            <Link
              href="/contribuir"
              className="font-medium text-atlantico-mata-atlantica underline-offset-2 hover:underline"
            >
              formulário de contribuição
            </Link>{' '}
            — categoria "outro".
          </p>
        </div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// TermCard
// ---------------------------------------------------------------------------

function TermCard({ term }: { term: GlossaryTerm }) {
  return (
    <div
      id={term.slug}
      className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <dt className="font-display text-lg font-semibold leading-tight text-foreground sm:text-xl">
        {term.term}
      </dt>
      <dd className="mt-2 space-y-3">
        <p className="text-sm font-medium text-atlantico-mar-profundo sm:text-base">
          {term.shortDef}
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">
          {term.longDef}
        </p>
        {term.example && (
          <div className="rounded-lg border border-atlantico-areia-quente/60 bg-atlantico-areia-quente/30 p-3 text-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-atlantico-terracota">
              Exemplo em Tamandaré
            </p>
            <p className="mt-1 text-foreground/85">{term.example}</p>
          </div>
        )}
        {term.refs && term.refs.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Onde aparece no estudo
            </p>
            <ul className="mt-1.5 space-y-1">
              {term.refs.map((ref) => (
                <li key={`${ref.doc}-${ref.page}`}>
                  <Link
                    href={`/legislacao/${ref.doc}/${ref.section}`}
                    className="inline-flex items-center gap-1.5 text-xs text-atlantico-mar-profundo hover:underline"
                  >
                    {DOCUMENTS[ref.doc].title} · p. {ref.page} — {ref.label}
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>{' '}
                  <a
                    href={pdfPageUrl(ref.doc, ref.page)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-2.5 w-2.5" aria-hidden />
                    PDF
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </dd>
    </div>
  );
}
