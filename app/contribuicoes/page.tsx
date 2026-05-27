import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  Paperclip,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { getPublishedContributions } from '@/lib/resultados/fetch';
import { ContributionCard } from '@/components/contribution-card';
import { CATEGORIES } from '@/lib/contribution/types';
import { CATEGORY_CONFIG } from '@/lib/contribution/categories';
import { MACROAREA_SLUGS } from '@/lib/zoneamento/macroareas';
import macroareasSeed from '@/db/seed/macroareas.example.json';

export const metadata = {
  title: 'Todas as contribuições — transparência ativa',
  description:
    'Lista pública e paginada de todas as contribuições enviadas à revisão do Plano Diretor de Tamandaré. Sem dados sensíveis: só primeiro nome (ou anônimo), conteúdo, áudio, anexos.',
};

export const revalidate = 60;

const CATEGORY_MAP = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.slug, c]),
);
const MACRO_BY_SLUG = Object.fromEntries(
  (macroareasSeed.macroareas as Array<{ slug: string; name: string }>).map(
    (m) => [m.slug, m.name],
  ),
);

type SearchParams = {
  page?: string;
  category?: string;
  macroarea?: string;
};

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default async function ContribuicoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parsePage(searchParams.page);
  const category =
    searchParams.category && (CATEGORIES as readonly string[]).includes(searchParams.category)
      ? searchParams.category
      : undefined;
  const macroareaSlug =
    searchParams.macroarea && MACROAREA_SLUGS.includes(searchParams.macroarea)
      ? searchParams.macroarea
      : undefined;

  const result = await getPublishedContributions({
    page,
    pageSize: 20,
    category,
    macroareaSlug,
  });

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = result && page < totalPages ? page + 1 : null;

  const filterParams = new URLSearchParams();
  if (category) filterParams.set('category', category);
  if (macroareaSlug) filterParams.set('macroarea', macroareaSlug);

  const linkFor = (p: number) => {
    const params = new URLSearchParams(filterParams);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : '/contribuicoes';
  };

  return (
    <main className="flex min-h-screen flex-col">
      {/* HEADER */}
      <section className="bg-praia-gradient border-b border-border">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Início
            </Link>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-atlantico-mar-profundo">
              Transparência total
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Todas as contribuições enviadas
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Cada contribuição publicada aparece aqui — com o que a pessoa
              escreveu, gravou em áudio ou anexou em foto. Sem dados sensíveis.
            </p>
          </div>
        </div>
      </section>

      {/* AVISO DE PRIVACIDADE */}
      <section className="container mx-auto px-4 pt-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-atlantico-mata-clara/60 bg-atlantico-mata-clara/15 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="h-5 w-5 flex-shrink-0 text-atlantico-mata-atlantica"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                O que aparece nesta lista (e o que nunca aparece)
              </p>
              <div className="mt-2 grid gap-3 text-xs text-foreground/85 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-atlantico-mata-atlantica">
                    APARECE
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    <li>· ID público (12 caracteres)</li>
                    <li>· Primeiro nome ou "Anônimo"</li>
                    <li>· Conteúdo completo</li>
                    <li>· Áudio gravado</li>
                    <li>· Anexos (fotos/PDF)</li>
                    <li>· Endereço/macroárea citados</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-atlantico-terracota">
                    NUNCA APARECE
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    <li>· CPF (nem o hash)</li>
                    <li>· E-mail</li>
                    <li>· Sobrenome</li>
                    <li>· UUID interno</li>
                    <li>· IP, user-agent</li>
                    <li>· Qualquer telemetria</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="container mx-auto px-4 pt-6">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Categoria:
            </span>
            <FilterChip
              label="Todas"
              active={!category}
              href={macroareaSlug ? `?macroarea=${macroareaSlug}` : '/contribuicoes'}
            />
            {CATEGORIES.map((c) => {
              const config = CATEGORY_MAP[c];
              if (!config) return null;
              const params = new URLSearchParams();
              params.set('category', c);
              if (macroareaSlug) params.set('macroarea', macroareaSlug);
              return (
                <FilterChip
                  key={c}
                  label={config.label}
                  active={category === c}
                  href={`?${params.toString()}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          {!result && (
            <p className="rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Base de contribuições indisponível no momento.
            </p>
          )}
          {result && result.items.length === 0 && (
            <p className="rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Nenhuma contribuição publicada nesse filtro.{' '}
              <Link
                href="/contribuir"
                className="font-medium text-atlantico-mar-profundo hover:underline"
              >
                Seja a primeira pessoa
              </Link>{' '}
              a contribuir.
            </p>
          )}
          {result && result.items.length > 0 && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {result.total.toLocaleString('pt-BR')} contribuições · página{' '}
                {page} de {totalPages}
              </p>
              <div className="space-y-4">
                {result.items.map((item) => (
                  <ContributionCard key={item.id} item={item} />
                ))}
              </div>

              {/* PAGINAÇÃO */}
              {(prevPage || nextPage) && (
                <nav className="mt-8 flex items-center justify-between">
                  {prevPage ? (
                    <Link
                      href={linkFor(prevPage)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      Página anterior
                    </Link>
                  ) : (
                    <span />
                  )}
                  {nextPage && (
                    <Link
                      href={linkFor(nextPage)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50"
                    >
                      Próxima página
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-atlantico-mar-profundo bg-atlantico-mar-profundo text-white'
          : 'border-border bg-card text-foreground hover:border-atlantico-mar-raso/40 hover:bg-muted/50'
      }`}
    >
      {label}
    </Link>
  );
}
