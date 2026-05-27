import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  ExternalLink,
  ArrowRight,
  Scale,
} from 'lucide-react';
import { Countdown } from '@/components/countdown';

export const metadata = {
  title: 'A audiência pública de 26/05/2026',
  description:
    'Convocação, fundamento legal e documentos oficiais da revisão do Plano Diretor de Tamandaré/PE.',
};

const PORTAL_OFICIAL = 'https://tamandare.pe.gov.br/plano-diretor-de-2026/';

export default function AudienciaPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <p className="text-sm uppercase tracking-wide text-zinc-500">
          Audiência Pública
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Revisão do Plano Diretor de Tamandaré
        </h1>
        <p className="mt-3 text-base text-zinc-300">
          Convocada pelo Edital nº 002/2026 do Gabinete do Prefeito, em
          consonância com o Estatuto da Cidade (Lei Federal nº 10.257/2001) e
          com a Recomendação nº 01/2025 do Ministério Público de PE.
        </p>
      </header>

      {/* Quando + Onde */}
      <section className="grid gap-4 sm:grid-cols-3">
        <InfoCard icon={Calendar} label="Data" value="26 de maio de 2026" hint="Terça-feira" />
        <InfoCard icon={Clock} label="Horário" value="18h00" hint="Por ordem de chegada" />
        <InfoCard icon={MapPin} label="Local" value="Auditório do CEPENE" />
      </section>

      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        <strong className="text-zinc-200">A audiência já aconteceu.</strong>{' '}
        Esta plataforma complementa a audiência: capta contribuições por escrito
        durante a janela legal de 5 dias após o evento.
      </div>

      {/* Countdown */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Prazo de contribuição escrita
        </h2>
        <Countdown />
      </section>

      {/* Documentos oficiais */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Documentos oficiais
        </h2>
        <p className="mb-4 text-sm text-zinc-400">
          Material técnico de fundamentação disponibilizado pela Prefeitura para
          leitura prévia à audiência.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <DocCard
            title="Circular 001-2026"
            subtitle="Convocação da audiência pública"
            pages="43 páginas"
            href={PORTAL_OFICIAL}
          />
          <DocCard
            title="Caderno ICR"
            subtitle="Análise Preliminar do Plano Diretor"
            pages="66 páginas · Instituto Cidades Responsivas"
            href={PORTAL_OFICIAL}
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Hospedados no portal oficial da Prefeitura Municipal de Tamandaré.
        </p>
      </section>

      {/* Caminhos pra contribuir */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Três caminhos pra contribuir
        </h2>
        <div className="flex flex-col gap-3">
          <PathCard
            n={1}
            label="Presencialmente (encerrado)"
            body="Quem compareceu à audiência de 26/05 teve até 3 minutos pra falar. As falas foram registradas em ata oficial."
            done
          />
          <PathCard
            n={2}
            label="Por escrito junto à Prefeitura (até 31/05)"
            body="Canal definido pela própria Circular. Protocolar diretamente no Gabinete do Prefeito."
          />
          <PathCard
            n={3}
            label="Pela plataforma Tamandaré Participa (até 31/05)"
            body="Contribuição estruturada, geolocalizada, com hash de integridade. Entra no relatório consolidado que protocolamos junto à Prefeitura."
            cta={{ href: '/contribuir', label: 'Contribuir agora' }}
            highlight
          />
        </div>
      </section>

      {/* Fundamento legal */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Fundamento legal
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-zinc-300">
          <FundamentoItem>
            Constituição Federal — artigos sobre Política Urbana (§ 182)
          </FundamentoItem>
          <FundamentoItem>
            Lei Federal nº 10.257/2001 (Estatuto da Cidade) — exige participação
            popular qualificada na elaboração e revisão de Planos Diretores
          </FundamentoItem>
          <FundamentoItem>
            Resoluções nº 25/2005 e 34/2005 do Conselho das Cidades
          </FundamentoItem>
          <FundamentoItem>
            Lei Orgânica do Município de Tamandaré
          </FundamentoItem>
          <FundamentoItem>
            Recomendação nº 01/2025 do Ministério Público de PE
          </FundamentoItem>
          <FundamentoItem>
            Plano Diretor vigente: <em>Lei Municipal nº 184/2002</em>, alterada
            por leis complementares posteriores
          </FundamentoItem>
        </ul>
      </section>

      {/* Navegação */}
      <nav className="mt-12 flex flex-col items-start gap-2 border-t border-zinc-800 pt-6 text-sm">
        <Link href="/diagnostico" className="inline-flex items-center gap-1 text-primary hover:underline">
          Ver o diagnóstico técnico em 5 indicadores
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/chat" className="inline-flex items-center gap-1 text-primary hover:underline">
          Tirar dúvidas com a IA (cita as páginas)
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link href="/" className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200">
          Voltar pra início
        </Link>
      </nav>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function InfoCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <p className="font-semibold text-zinc-100">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function DocCard({
  title,
  subtitle,
  pages,
  href,
}: {
  title: string;
  subtitle: string;
  pages: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 transition-colors hover:border-primary/40"
    >
      <div className="mb-3 flex items-center gap-2 text-primary">
        <FileText className="h-4 w-4" aria-hidden />
        <span className="text-xs uppercase tracking-wide">PDF oficial</span>
      </div>
      <p className="font-semibold text-zinc-100">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      <p className="mt-2 text-xs text-zinc-500">{pages}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
        Abrir no portal da Prefeitura
        <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  );
}

function PathCard({
  n,
  label,
  body,
  done,
  highlight,
  cta,
}: {
  n: number;
  label: string;
  body: string;
  done?: boolean;
  highlight?: boolean;
  cta?: { href: string; label: string };
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? 'border-primary/40 bg-primary/5'
          : done
            ? 'border-zinc-800 bg-zinc-950/40 opacity-60'
            : 'border-zinc-800 bg-zinc-950/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ${
            highlight
              ? 'bg-primary/20 text-primary'
              : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          {n}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-zinc-100">{label}</p>
          <p className="mt-1 text-sm text-zinc-400">{body}</p>
          {cta && (
            <Link
              href={cta.href}
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {cta.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function FundamentoItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden />
      <span>{children}</span>
    </li>
  );
}
