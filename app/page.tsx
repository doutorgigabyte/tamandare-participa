import Link from 'next/link';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { Countdown } from '@/components/countdown';
import { PhotoHero } from '@/components/photo-hero';
import { PlaceCard } from '@/components/place-card';
import { getAggregates } from '@/lib/resultados/fetch';
import { findIndicador } from '@/lib/diagnostico/indicadores';
import { PHOTOS } from '@/lib/images/photos';

export const revalidate = 60;

export default async function HomePage() {
  const agg = await getAggregates();
  const teaser = findIndicador('acesso-habitacional');

  return (
    <main className="flex min-h-screen flex-col">
      <PhotoHero
        photo={PHOTOS.carneirosCapela}
        eyebrow="Revisão do Plano Diretor · até 31 mai 2026"
        title="O futuro de Tamandaré decidido com a sua gente."
        description="Plataforma cívica pra você entender, opinar e acompanhar a revisão do Plano Diretor — em até 5 minutos pelo celular."
        actions={
          <>
            <HeroCTA
              href="/contribuir"
              label="Quero contribuir"
              tone="primary"
            />
            <HeroCTA
              href="/diagnostico"
              label="Entender o diagnóstico"
              tone="ghost"
            />
          </>
        }
      />

      {/* COUNTDOWN + LIVE STATS */}
      <section className="container mx-auto -mt-12 px-4 sm:-mt-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <Countdown />
          {agg && agg.total > 0 && <LiveStats agg={agg} />}
        </div>
      </section>

      {/* COMO FUNCIONA — 3 cards com foto */}
      <section className="container mx-auto px-4 py-20 sm:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-atlantico-mar-profundo">
            Como funciona
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Três passos. Cinco minutos. Sua voz no relatório oficial.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Você não precisa ler o Plano inteiro. A gente traduziu para você.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <PlaceCard
            photo={PHOTOS.igrejaSaoPedro}
            eyebrow="1 · Entenda"
            title="Em números, o que importa"
            description="5 indicadores comparando Tamandaré com o Brasil: habitação, mobilidade, vegetação, patrimônio."
            href="/diagnostico"
            ctaLabel="Ver diagnóstico"
            tone="default"
          />
          <PlaceCard
            photo={PHOTOS.forteSantoInacio}
            eyebrow="2 · Localize"
            title="Sua macroárea, sua regra"
            description="Como o novo zoneamento afeta sua rua, sua praia, sua quadra. As 10 macroáreas no mapa."
            href="/zoneamento"
            ctaLabel="Ver mapa"
            tone="accent"
          />
          <PlaceCard
            photo={PHOTOS.pescadores}
            eyebrow="3 · Contribua"
            title="Texto livre, voz oficial"
            description="Anônimo se preferir. Geolocalizada, com hash de integridade. Entra no relatório protocolado."
            href="/contribuir"
            ctaLabel="Contribuir agora"
            tone="mata"
          />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm text-foreground shadow-soft transition-colors hover:border-atlantico-mar-raso/50 hover:bg-muted/50"
          >
            <MessageSquare className="h-4 w-4 text-atlantico-mar-profundo" />
            Ou pergunte direto pra IA — ela cita as páginas exatas do Plano
          </Link>
        </div>
      </section>

      {/* DIAGNÓSTICO TEASER — usando paleta nova */}
      {teaser && (
        <section className="container mx-auto px-4 pb-20">
          <Link
            href={`/diagnostico/${teaser.slug}`}
            className="group block overflow-hidden rounded-2xl border border-atlantico-terracota/30 bg-gradient-to-br from-atlantico-terracota-clara/30 to-card p-8 shadow-card transition-all hover:border-atlantico-terracota/60 hover:shadow-hero sm:p-10"
          >
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
              <div className="flex-shrink-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-atlantico-terracota">
                  Você sabia?
                </p>
                <p className="mt-3 font-display text-5xl font-semibold leading-none tracking-tight text-atlantico-terracota sm:text-7xl">
                  {teaser.big_number}
                </p>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                  Tamandaré tem o pior cenário habitacional entre cidades
                  comparáveis do Brasil.
                </h2>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  Uma família precisaria de mais que a renda inteira pra pagar
                  uma casa mediana. O novo Plano Diretor pode mudar isso — ou
                  agravar. Entenda os outros 4 indicadores e contribua.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-atlantico-terracota group-hover:gap-2.5 transition-all">
                  Ver detalhe e contribuir sobre habitação
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* NAV SECUNDÁRIA */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link href="/legislacao" className="hover:text-foreground">
            Legislação e estudos técnicos
          </Link>
          <span className="text-border">·</span>
          <Link href="/audiencia" className="hover:text-foreground">
            A audiência de 26/05
          </Link>
          <span className="text-border">·</span>
          <Link href="/contribuicoes" className="hover:text-foreground">
            Todas as contribuições
          </Link>
          <span className="text-border">·</span>
          <Link href="/resultados" className="hover:text-foreground">
            Resultados ao vivo
          </Link>
          <span className="text-border">·</span>
          <Link href="/sobre" className="hover:text-foreground">
            Sobre a plataforma
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center text-xs text-muted-foreground">
          <p>
            Plataforma cívica independente. Desenvolvida pela{' '}
            <span className="font-medium text-foreground">Doutor Gigabyte</span>{' '}
            — 2026.
          </p>
          <p>Sem viés partidário · LGPD compliant · Código aberto</p>
          <p className="mt-2 text-[10px]">
            Fotos: Wikimedia Commons (CC BY / CC BY-SA). Créditos individuais
            sob cada imagem.
          </p>
        </div>
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// LiveStats — embutido no card do hero
// ---------------------------------------------------------------------------

function LiveStats({
  agg,
}: {
  agg: NonNullable<Awaited<ReturnType<typeof getAggregates>>>;
}) {
  const macroareasCovered = Object.keys(agg.by_macroarea).filter(
    (k) => k !== '__none__' && agg.by_macroarea[k] > 0,
  ).length;

  const lastContribution = agg.recent[0]?.created_at;
  const lastAgo = lastContribution
    ? formatRelativeMinutes(lastContribution)
    : null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
      <Stat
        value={agg.total.toLocaleString('pt-BR')}
        label="contribuições enviadas"
      />
      <span className="text-border">·</span>
      <Stat value={`${macroareasCovered}/10`} label="macroáreas com voz" />
      {lastAgo && (
        <>
          <span className="text-border">·</span>
          <Stat value={lastAgo} label="desde a última" />
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-display text-base font-semibold text-foreground">
        {value}
      </span>
      <span>{label}</span>
    </span>
  );
}

function formatRelativeMinutes(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

// ---------------------------------------------------------------------------
// Hero CTA
// ---------------------------------------------------------------------------

function HeroCTA({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: 'primary' | 'ghost';
}) {
  const base =
    'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all';
  const styles =
    tone === 'primary'
      ? 'bg-atlantico-mar-raso text-white shadow-card hover:bg-atlantico-mar-profundo hover:shadow-hero'
      : 'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20';
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
