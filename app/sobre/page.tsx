import Link from 'next/link';
import {
  AlertCircle,
  ShieldCheck,
  Heart,
  Code2,
  Github,
  Mail,
} from 'lucide-react';

export const metadata = {
  title: 'Sobre a plataforma',
  description:
    'Tamandaré Participa é uma iniciativa cidadã independente do desenvolvedor João Henrique Medeiros (Doutor Gigabyte). Sem vínculo com Prefeitura, Câmara, ICR ou qualquer órgão público.',
};

export default function SobrePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-atlantico-mar-profundo">
          Sobre a plataforma
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Uma iniciativa cidadã, não um canal oficial.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Tamandaré Participa é uma plataforma cívica{' '}
          <strong className="font-medium text-foreground">independente</strong>,
          feita voluntariamente por um morador. Não tem vínculo com a Prefeitura
          de Tamandaré, com a Câmara Municipal, com o Instituto Cidades
          Responsivas (ICR) ou com qualquer outro órgão público.
        </p>
      </header>

      {/* QUEM FEZ */}
      <section className="mt-12">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-atlantico-terracota/15 text-atlantico-terracota">
            <Heart className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Quem fez e por quê
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-base">
              Meu nome é{' '}
              <strong className="font-semibold text-foreground">
                João Henrique Medeiros
              </strong>
              , sou desenvolvedor e fundador da{' '}
              <strong className="font-semibold text-foreground">
                Doutor Gigabyte
              </strong>{' '}
              — uma agência de tecnologia em Pernambuco. Estive na primeira
              audiência pública da revisão do Plano Diretor (26/05/2026) e
              percebi, no presencial, que a maior parte das pessoas não
              conseguia acompanhar tecnicamente o que estava sendo discutido —
              nem teria tempo de ler 146 páginas de estudo antes de opinar.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-base">
              Como tenho conhecimento técnico pra montar uma ferramenta digital,
              fiz essa plataforma na semana seguinte. Custo zero, prazo zero,
              vínculo zero. É só uma <em>contribuição cidadã extra</em>: um
              tradutor entre a linguagem urbanística e a vida prática de quem
              mora aqui.
            </p>
          </div>
        </div>
      </section>

      {/* O QUE É E O QUE NÃO É */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-atlantico-mata-clara/60 bg-atlantico-mata-clara/15 p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mata-atlantica">
            O que essa plataforma é
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/90">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-mata-atlantica" aria-hidden />
              <span>Ferramenta independente de coleta e organização de contribuições cidadãs</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-mata-atlantica" aria-hidden />
              <span>Tradutora da linguagem urbanística pra português claro (ver <Link href="/legislacao/glossario" className="font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline">glossário</Link>)</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-mata-atlantica" aria-hidden />
              <span>Espaço público pra que todas as contribuições enviadas fiquem visíveis (ver <Link href="/contribuicoes" className="font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline">/contribuicoes</Link>)</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-mata-atlantica" aria-hidden />
              <span>Iniciativa voluntária, código aberto, sem fins comerciais</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-atlantico-terracota/40 bg-atlantico-terracota-clara/25 p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-terracota">
            O que essa plataforma NÃO é
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/90">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-terracota" aria-hidden />
              <span>NÃO é canal oficial da Prefeitura ou de qualquer órgão público</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-terracota" aria-hidden />
              <span>NÃO substitui o protocolo oficial de contribuições</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-terracota" aria-hidden />
              <span>NÃO tem vínculo com partido político, vereador, secretaria ou candidato</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-terracota" aria-hidden />
              <span>NÃO emite parecer oficial, nem decide o que entra ou não no Plano final</span>
            </li>
          </ul>
        </div>
      </section>

      {/* O QUE ACONTECE COM AS CONTRIBUIÇÕES */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-atlantico-mar-profundo" aria-hidden />
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              O que vai acontecer com as contribuições
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-base">
              Toda contribuição enviada pela plataforma fica{' '}
              <strong className="font-medium text-foreground">
                pública e auditável
              </strong>{' '}
              em{' '}
              <Link
                href="/contribuicoes"
                className="font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline"
              >
                /contribuicoes
              </Link>
              . Periodicamente, vou consolidar tudo num documento (sem
              identificar ninguém) e <strong className="font-medium text-foreground">protocolar junto à Prefeitura como contribuição cidadã</strong>{' '}
              — qualquer cidadão tem esse direito, e é assim que eu vou exercer
              o meu.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-base">
              Mas isso{' '}
              <strong className="font-medium text-foreground">
                NÃO substitui
              </strong>{' '}
              o seu protocolo individual nos canais oficiais. Se você quer ter
              certeza de que sua contribuição entra no processo formal, envie
              também diretamente pra Prefeitura — pelos meios que ela divulgar
              no cronograma oficial.
            </p>
          </div>
        </div>
      </section>

      {/* CRONOGRAMA */}
      <section className="mt-8 rounded-2xl border border-atlantico-mar-raso/30 bg-atlantico-mar-raso/5 p-6 sm:p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mar-profundo">
          Cronograma
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90 sm:text-base">
          Na audiência de 26/05/2026, a Prefeitura sinalizou que vai estabelecer
          um cronograma próprio de contribuições. Assim que as datas oficiais
          forem divulgadas, esta plataforma será atualizada — e idealmente vai
          incorporar o cronograma público de forma navegável (eventos,
          documentos, prazos). Por enquanto, a coleta segue aberta.
        </p>
      </section>

      {/* PRIVACIDADE LGPD */}
      <section
        id="privacidade"
        className="mt-12 scroll-mt-20 border-t border-border pt-8"
        aria-labelledby="privacidade-heading"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="h-6 w-6 flex-shrink-0 text-atlantico-mata-atlantica"
            aria-hidden
          />
          <div>
            <h2
              id="privacidade-heading"
              className="font-display text-2xl font-semibold tracking-tight text-foreground"
            >
              Política de Privacidade (LGPD)
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
              Esta plataforma trata dados pessoais com base no consentimento
              explícito do(a) titular (Lei nº 13.709/2018, art. 7º, I), e apenas
              pra finalidade declarada: organizar contribuições cidadãs sobre a
              revisão do Plano Diretor de Tamandaré/PE. Não há compartilhamento
              com terceiros pra fins comerciais, publicitários ou de marketing.
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3 text-sm text-foreground sm:text-base">
          <PrivacyItem title="Consentimento explícito">
            Nome, e-mail e CPF só são solicitados após você marcar
            expressamente a opção de identificar-se e aceitar esta política no
            envio.
          </PrivacyItem>
          <PrivacyItem title="Só o primeiro nome aparece publicamente">
            Quando você se identifica, só seu primeiro nome aparece em{' '}
            <Link
              href="/contribuicoes"
              className="font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline"
            >
              /contribuicoes
            </Link>{' '}
            (ou "Anônimo" se preferir). Sobrenome, e-mail e CPF nunca são
            expostos.
          </PrivacyItem>
          <PrivacyItem title="CPF hasheado">
            O CPF nunca é armazenado em texto claro. Guardamos apenas um hash
            criptográfico (SHA-256 com salt) que serve pra detectar
            duplicatas, sem permitir recuperar o número original.
          </PrivacyItem>
          <PrivacyItem title="Anonimato é cidadania de primeira classe">
            Contribuições anônimas têm o mesmo peso no documento que será
            protocolado. Você não precisa se identificar pra ser ouvido(a).
          </PrivacyItem>
          <PrivacyItem title="Direito ao esquecimento">
            Você pode solicitar a exclusão da sua contribuição a qualquer
            momento, por e-mail. Um botão de auto-serviço entra na próxima
            versão.
          </PrivacyItem>
          <PrivacyItem title="Transparência e integridade">
            Cada contribuição recebe um hash de integridade (SHA-256) que
            permite verificar, depois, que o texto não foi adulterado. O hash
            aparece no comprovante em PDF.
          </PrivacyItem>
        </ul>
      </section>

      {/* CONTATO + CÓDIGO */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <a
          href="mailto:doutorgigabyte.ti@gmail.com"
          className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:border-atlantico-mar-raso/40 hover:shadow-card"
        >
          <Mail className="h-5 w-5 flex-shrink-0 text-atlantico-mar-profundo" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">
              Contato direto
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              doutorgigabyte.ti@gmail.com
            </p>
            <p className="mt-2 text-xs text-foreground/80">
              Dúvidas sobre tratamento de dados, sugestões de melhoria ou
              pedido de exclusão de contribuição.
            </p>
          </div>
        </a>
        <a
          href="https://github.com/doutorgigabyte/tamandare-participa"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:border-atlantico-mar-raso/40 hover:shadow-card"
        >
          <Code2 className="h-5 w-5 flex-shrink-0 text-atlantico-mar-profundo" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">
              Código aberto
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              github.com/doutorgigabyte/tamandare-participa
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-foreground/80">
              <Github className="h-3 w-3" aria-hidden />
              Audite o código, abra issues, fork pro seu município
            </p>
          </div>
        </a>
      </section>

      <p className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        Iniciativa independente · sem viés partidário · sem fins comerciais
      </p>
    </main>
  );
}

function PrivacyItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-atlantico-mata-atlantica"
        aria-hidden
      />
      <span>
        <strong className="font-semibold text-foreground">{title}.</strong>{' '}
        <span className="text-foreground/85">{children}</span>
      </span>
    </li>
  );
}
