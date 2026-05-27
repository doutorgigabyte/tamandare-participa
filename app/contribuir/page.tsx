import { ContributionWizard } from './_components/contribution-wizard';
import { CATEGORIES, type Category } from '@/lib/contribution/types';
import { MACROAREA_SLUGS } from '@/lib/zoneamento/macroareas';

export const metadata = {
  title: 'Contribuir',
  description:
    'Envie sua contribuição à revisão do Plano Diretor de Tamandaré. Mobile-first, leva ~3 minutos.',
};

type SearchParams = {
  category?: string;
  from_diagnostico?: string;
  from_macroarea?: string;
};

function parseCategoryParam(raw: string | undefined): Category | undefined {
  if (!raw) return undefined;
  return (CATEGORIES as readonly string[]).includes(raw)
    ? (raw as Category)
    : undefined;
}

function parseMacroareaParam(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return MACROAREA_SLUGS.includes(raw) ? raw : undefined;
}

export default function ContribuirPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const initialCategory = parseCategoryParam(searchParams.category);
  // /zoneamento e /zoneamento/[slug] mandam `?from_macroarea=X` pra pré-selecionar
  // a macroárea no step 3 do wizard.
  const initialMacroarea =
    parseMacroareaParam(searchParams.from_macroarea) ??
    parseMacroareaParam(searchParams.from_diagnostico); // fallback p/ links antigos

  return (
    <main className="container mx-auto px-4 py-10 md:py-16">
      <header className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Envie sua contribuição
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Sua opinião fica pública em /contribuicoes e entra no documento que será protocolado como contribuição cidadã.
          Leva cerca de 3 minutos.
        </p>
      </header>

      <ContributionWizard
        initialCategory={initialCategory}
        initialMacroarea={initialMacroarea}
      />
    </main>
  );
}
