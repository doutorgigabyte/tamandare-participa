import { getAggregates } from '@/lib/resultados/fetch';
import { StatCards } from './_components/stat-cards';
import { MacroareaBreakdown } from './_components/macroarea-breakdown';
import { CategoryBreakdown } from './_components/category-breakdown';
import { RecentList } from './_components/recent-list';
import { EmptyState } from './_components/empty-state';
import { RealtimeRefresher } from './_components/realtime-refresher';

export const metadata = {
  title: 'Resultados — o que Tamandaré está dizendo',
  description:
    'Contribuições agregadas por macroárea e categoria, sem identidades. Transparência ativa em tempo real.',
};

// Realtime via subscription Supabase em <RealtimeRefresher /> faz o trabalho
// fino — esse ISR de 60s é só rede de segurança caso o WebSocket esteja off.
export const revalidate = 60;

export default async function ResultadosPage() {
  const agg = await getAggregates();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8 max-w-3xl">
        <div className="flex items-center gap-3">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Transparência ativa
          </p>
          <RealtimeRefresher />
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          O que Tamandaré está dizendo
        </h1>
        <p className="mt-3 text-base text-foreground/90">
          Contribuições agregadas por macroárea e categoria, sem identidades. O
          conteúdo é exibido após validação automática anti-spam e passa por
          revisão humana antes de virar parte do documento independente que será protocolado como contribuição cidadã.
        </p>
      </header>

      {!agg && <EmptyState reason="infra_pending" />}
      {agg && agg.total === 0 && <EmptyState reason="zero_contributions" />}

      {agg && agg.total > 0 && (
        <div className="flex flex-col gap-8">
          <StatCards agg={agg} />

          <div className="grid gap-6 md:grid-cols-2">
            <MacroareaBreakdown agg={agg} />
            <CategoryBreakdown agg={agg} />
          </div>

          <RecentList items={agg.recent} />
        </div>
      )}

      <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
        Dados agregados sem expor identidades. Atualização ao vivo via Supabase
        Realtime (com fallback ISR 60s). Mapa de calor por macroárea + extração
        de temas via NLP + análise de sentimento entram no MVP 2.
      </footer>
    </main>
  );
}
