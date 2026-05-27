import Link from 'next/link';
import { ArrowRight, MapPin, MessageSquare, Send, TrendingUp } from 'lucide-react';
import { Countdown } from '@/components/countdown';
import { getAggregates } from '@/lib/resultados/fetch';
import { findIndicador } from '@/lib/diagnostico/indicadores';

// ISR: revalida a cada 60s pra refletir contribuições novas sem martelar o DB.
export const revalidate = 60;

export default async function HomePage() {
  // Server-side: live stats (null se Supabase off).
  const agg = await getAggregates();
  const teaser = findIndicador('acesso-habitacional');

  return (
    <main className="flex min-h-screen flex-col">
      {/* HERO */}
      <section className="container mx-auto flex flex-col items-center px-4 py-16 sm:py-20">
        <h1 className="bg-gradient-to-br from-zinc-50 to-zinc-400 bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
          Tamandaré Participa
        </h1>
        <p className="mt-6 max-w-2xl text-center text-lg text-zinc-300 sm:text-xl">
          O futuro da cidade deve ser planejado, decidido e validado com a sua
          gente.
        </p>

        <div className="mt-12 w-full max-w-xl">
          <Countdown />
        </div>

        <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <CTA href="/diagnostico" label="Entender o diagnóstico" tone="primary" />
          <CTA href="/zoneamento" label="Em qual macroárea eu moro?" tone="secondary" />
          <CTA href="/contribuir" label="Quero contribuir" tone="neutral" />
        </div>

        {agg && agg.total > 0 && <LiveStats agg={agg} />}
      </section>

      {/* DIAGNÓSTICO TEASER */}
      {teaser && (
        <section className="container mx-auto px-4 pb-12">
          <Link
            href={`/diagnostico/${teaser.slug}`}
            className="group block rounded-2xl border border-red-900/40 bg-gradient-to-br from-red-950/30 to-zinc-950 p-8 transition-all hover:border-red-900/70"
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div>
                <p className="text-xs uppercase tracking-wide text-red-400">
                  Você sabia?
                </p>
                <p className="mt-2 font-mono text-6xl font-bold tracking-tight text-red-400 sm:text-7xl">
                  {teaser.big_number}
                </p>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-zinc-100">
                  Tamandaré tem o pior cenário habitacional entre as cidades
                  comparáveis do Brasil.
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Uma família precisaria de mais que a renda inteira pra pagar
                  uma casa mediana. O novo Plano Diretor pode mudar isso — ou
                  agravar. Entenda os outros 4 indicadores e contribua.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-red-300 group-hover:underline">
                  Ver detalhe e contribuir sobre habitação
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* COMO FUNCIONA */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Como funciona
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">
            5 minutos no celular, sua voz no relatório oficial
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          <StepCard
            n={1}
            icon={TrendingUp}
            title="Entenda em números"
            body="5 indicadores comparando Tamandaré com o Brasil — habitação, mobilidade, vegetação, patrimônio."
            href="/diagnostico"
            cta="Ver diagnóstico"
          />
          <StepCard
            n={2}
            icon={MapPin}
            title="Veja sua macroárea"
            body="Como o novo zoneamento afeta sua rua, sua praia, sua quadra. Identifique a região que importa pra ti."
            href="/zoneamento"
            cta="Ver mapa"
          />
          <StepCard
            n={3}
            icon={Send}
            title="Envie sua contribuição"
            body="Texto livre, anônimo se quiser. Geolocalizada, com hash de integridade. Entra no relatório protocolado."
            href="/contribuir"
            cta="Contribuir"
          />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-primary/40 hover:text-zinc-100"
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            Ou pergunte direto pra IA — ela cita as páginas exatas
          </Link>
        </div>
      </section>

      {/* NAV SECUNDÁRIA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-zinc-500">
          <Link href="/audiencia" className="hover:text-zinc-200">
            A audiência de 26/05
          </Link>
          <span className="text-zinc-700">·</span>
          <Link href="/resultados" className="hover:text-zinc-200">
            Resultados ao vivo
          </Link>
          <span className="text-zinc-700">·</span>
          <Link href="/sobre" className="hover:text-zinc-200">
            Sobre a plataforma
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-800/70 py-6">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-xs text-zinc-500">
          <p>
            Plataforma cívica independente. Desenvolvida pela{' '}
            <span className="text-zinc-300">Doutor Gigabyte</span> — 2026.
          </p>
          <p className="text-zinc-600">
            Sem viés partidário · LGPD compliant · Código aberto
          </p>
        </div>
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// LiveStats
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
  const lastAgo = lastContribution ? formatRelativeMinutes(lastContribution) : null;

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-400">
      <Stat
        value={agg.total.toLocaleString('pt-BR')}
        label="contribuições já enviadas"
      />
      <span className="text-zinc-700">·</span>
      <Stat value={`${macroareasCovered}/10`} label="macroáreas com voz" />
      {lastAgo && (
        <>
          <span className="text-zinc-700">·</span>
          <Stat value={lastAgo} label="desde a última" />
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono font-semibold text-zinc-100">{value}</span>
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
// StepCard
// ---------------------------------------------------------------------------

type StepCardProps = {
  n: number;
  icon: typeof TrendingUp;
  title: string;
  body: string;
  href: string;
  cta: string;
};

function StepCard({ n, icon: Icon, title, body, href, cta }: StepCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 transition-all hover:border-primary/40"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-mono text-sm font-bold text-primary">
          {n}
        </span>
        <Icon className="h-4 w-4 text-zinc-500" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-zinc-400">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary group-hover:underline">
        {cta}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------

type CTAProps = {
  href: string;
  label: string;
  tone: 'primary' | 'secondary' | 'neutral';
};

function CTA({ href, label, tone }: CTAProps) {
  const base =
    'flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-transform hover:scale-[1.02] active:scale-100';
  const styles =
    tone === 'primary'
      ? 'bg-[#00D9FF] text-zinc-950 hover:bg-[#22e3ff]'
      : tone === 'secondary'
        ? 'bg-[#FF6B35] text-white hover:bg-[#ff7d4d]'
        : 'border border-zinc-700 bg-zinc-900/40 text-zinc-100 hover:bg-zinc-800';
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {label}
    </Link>
  );
}
