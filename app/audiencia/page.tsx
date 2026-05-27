import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  ExternalLink,
  ArrowRight,
  Scale,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'A audiência pública de 26/05/2026',
  description:
    'O que foi a primeira audiência pública da revisão do Plano Diretor de Tamandaré/PE, documentos oficiais e fundamento legal. Cronograma de próximas etapas em definição.',
};

const PORTAL_OFICIAL = 'https://tamandare.pe.gov.br/plano-diretor-de-2026/';

export default function AudienciaPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-atlantico-mar-profundo">
          Audiência Pública
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Revisão do Plano Diretor de Tamandaré
        </h1>
        <p className="mt-3 text-base text-foreground/90">
          Convocada pelo Edital nº 002/2026 do Gabinete do Prefeito, em
          consonância com o Estatuto da Cidade (Lei Federal nº 10.257/2001) e
          com a Recomendação nº 01/2025 do Ministério Público de PE.
        </p>
      </header>

      {/* Quando + Onde — audiência já aconteceu */}
      <section className="grid gap-4 sm:grid-cols-3">
        <InfoCard icon={Calendar} label="Data" value="26 de maio de 2026" hint="Terça-feira" />
        <InfoCard icon={Clock} label="Horário" value="18h00" hint="Por ordem de chegada" />
        <InfoCard icon={MapPin} label="Local" value="Auditório do CEPENE" />
      </section>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-atlantico-mata-clara/60 bg-atlantico-mata-clara/15 p-4 text-sm">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-atlantico-mata-atlantica" aria-hidden />
        <div>
          <p className="font-medium text-foreground">A audiência já aconteceu.</p>
          <p className="mt-1 text-foreground/85">
            Na ocasião, foi sinalizado que a Prefeitura vai estabelecer um{' '}
            <strong className="font-medium text-foreground">cronograma próprio</strong>{' '}
            de contribuições — ainda não divulgado.
          </p>
        </div>
      </div>

      {/* Cronograma em definição */}
      <section className="mt-10 rounded-2xl border border-atlantico-mar-raso/30 bg-atlantico-mar-raso/5 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-atlantico-mar-profundo" aria-hidden />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mar-profundo">
              Próximas etapas
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
              Cronograma em definição pela Prefeitura
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85 sm:text-base">
              Ainda não há prazos novos publicados pra protocolo de
              contribuições oficiais. Assim que o cronograma for divulgado,
              esta página será atualizada — e idealmente vai incorporar uma{' '}
              <strong className="font-medium text-foreground">
                linha do tempo pública
              </strong>{' '}
              de eventos, prazos e documentos.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Acompanhe pelo{' '}
              <a
                href={PORTAL_OFICIAL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline"
              >
                portal oficial da Prefeitura
              </a>{' '}
              ou aguarde notícias por aqui.
            </p>
          </div>
        </div>
      </section>

      {/* Documentos oficiais — apontam pra /legislacao agora */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight text-foreground">
          Documentos de fundamentação
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Material técnico que embasou a revisão. Pode baixar e navegar por
          seções aqui mesmo na plataforma.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <DocCard
            title="Circular 001-2026"
            subtitle="Convocação da audiência pública"
            pages="43 páginas · Prefeitura"
            href="/legislacao/circular"
          />
          <DocCard
            title="Caderno ICR"
            subtitle="Análise Preliminar do Plano Diretor"
            pages="66 páginas · Instituto Cidades Responsivas"
            href="/legislacao/caderno"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Também disponível na{' '}
          <a
            href={PORTAL_OFICIAL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            página oficial da Prefeitura
          </a>
          .
        </p>
      </section>

      {/* Caminhos pra contribuir */}
      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight text-foreground">
          Como contribuir, hoje
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Os canais oficiais é a Prefeitura quem define. Esta plataforma é uma
          forma complementar e independente.
        </p>
        <div className="flex flex-col gap-3">
          <PathCard
            n={1}
            label="Presencialmente — audiência de 26/05 (encerrada)"
            body="Quem compareceu teve até 3 minutos pra falar. As falas foram registradas em ata oficial pela Prefeitura."
            done
          />
          <PathCard
            n={2}
            label="Por escrito junto à Prefeitura (cronograma em definição)"
            body="Canal oficial. Modalidade, endereço de protocolo e novo prazo serão definidos pela Prefeitura — acompanhe o portal oficial."
          />
          <PathCard
            n={3}
            label="Pela plataforma Tamandaré Participa (sempre aberto)"
            body="Iniciativa independente. Contribuições ficam públicas em /contribuicoes. Periodicamente serão consolidadas e protocoladas como contribuição cidadã — sem substituir o protocolo individual oficial."
            cta={{ href: '/contribuir', label: 'Contribuir agora' }}
            highlight
          />
        </div>
      </section>

      {/* Fundamento legal */}
      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight text-foreground">
          Fundamento legal
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-foreground/90">
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
      <nav className="mt-12 flex flex-col items-start gap-2 border-t border-border pt-6 text-sm">
        <Link
          href="/legislacao"
          className="inline-flex items-center gap-1 font-medium text-atlantico-mar-profundo hover:underline"
        >
          Documentos completos com glossário urbanístico
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/diagnostico"
          className="inline-flex items-center gap-1 font-medium text-atlantico-mar-profundo hover:underline"
        >
          Ver o diagnóstico técnico em 5 indicadores
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/chat"
          className="inline-flex items-center gap-1 font-medium text-atlantico-mar-profundo hover:underline"
        >
          Tirar dúvidas com a IA (cita as páginas)
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
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
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <p className="font-display font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
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
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:border-atlantico-mar-raso/40 hover:shadow-card"
    >
      <div className="mb-3 flex items-center gap-2 text-atlantico-mar-profundo">
        <FileText className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide">
          Documento
        </span>
      </div>
      <p className="font-display font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <p className="mt-2 text-xs text-muted-foreground">{pages}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-atlantico-mar-profundo group-hover:underline">
        Navegar por seções
        <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
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
          ? 'border-atlantico-mar-raso/40 bg-atlantico-mar-raso/5'
          : done
            ? 'border-border bg-muted/40 opacity-70'
            : 'border-border bg-card shadow-soft'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold ${
            highlight
              ? 'bg-atlantico-mar-raso/20 text-atlantico-mar-profundo'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {n}
        </span>
        <div className="flex-1">
          <p className="font-medium text-foreground">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          {cta && (
            <Link
              href={cta.href}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-atlantico-mar-profundo hover:underline"
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
      <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span>{children}</span>
    </li>
  );
}
