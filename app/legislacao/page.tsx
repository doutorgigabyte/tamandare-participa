import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Download,
  FileText,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import {
  DOCS_LIST,
  getDocPhoto,
  type DocumentSummary,
} from '@/lib/docs/sources';
import { PhotoCredit } from '@/components/photo-credit';

export const metadata = {
  title: 'Legislação e estudos técnicos',
  description:
    'Acesse os documentos oficiais da revisão do Plano Diretor de Tamandaré: Circular 001-2026 e Análise Preliminar do ICR. Navegue por seções, baixe os PDFs, consulte o glossário.',
};

export default function LegislacaoIndex() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* HEADER */}
      <section className="bg-praia-gradient border-b border-border">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-atlantico-mar-profundo">
              Documentos oficiais
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Legislação e estudos técnicos
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Aqui você encontra os dois documentos que fundamentam a revisão do
              Plano Diretor — em PDF, navegáveis por seção, com referência exata
              de página.
            </p>
          </div>
        </div>
      </section>

      {/* BANNER REQUISITO ICR */}
      <section className="container mx-auto px-4 pt-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-atlantico-mar-raso/30 bg-atlantico-mar-raso/5 p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mar-profundo">
            Por que essa página existe
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground sm:text-base">
            A própria equipe que elaborou o estudo (Instituto Cidades
            Responsivas) identificou que a legislação urbanística do Município
            precisa ser{' '}
            <strong className="font-medium">
              disponibilizada de forma mais clara e explicativa
            </strong>
            , e que a população se beneficiaria de ferramentas que ajudem a
            entender os parâmetros construtivos, sobretudo para quem não é
            especialista. Esta página tenta atender exatamente esse pedido.
          </p>
        </div>
      </section>

      {/* CARDS DE DOCUMENTOS */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {DOCS_LIST.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
      </section>

      {/* GLOSSÁRIO + HISTÓRICO */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          <Link
            href="/legislacao/glossario"
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:border-atlantico-mar-raso/40 hover:shadow-card"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-atlantico-mar-raso/15 text-atlantico-mar-profundo">
              <BookOpen className="h-6 w-6" aria-hidden />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
                Glossário urbanístico
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gabarito, taxa de ocupação, coeficiente, recuo, ZEIS… O que cada
                termo significa, em português claro.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-atlantico-mar-profundo group-hover:gap-2.5 transition-all">
                Abrir glossário
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
          </Link>

          <a
            href="https://tamandare.pe.gov.br/plano-diretor-de-2026/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:border-atlantico-mar-raso/40 hover:shadow-card"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-atlantico-mar-profundo">
              <ExternalLink className="h-5 w-5" aria-hidden />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
                Página oficial da Prefeitura
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Acesse a fonte primária com avisos oficiais, anexos extras e
                atualizações do processo.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-atlantico-mar-profundo">
                tamandare.pe.gov.br/plano-diretor-de-2026
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* SOBRE A CONSOLIDAÇÃO HISTÓRICA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-terracota">
            Histórico da legislação
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Mais de 20 anos de alterações pontuais — agora consolidadas
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            O Plano Diretor vigente foi instituído pela{' '}
            <strong className="text-foreground">Lei Municipal nº 184/2002</strong>{' '}
            e, ao longo de mais de duas décadas, sofreu{' '}
            <strong className="text-foreground">sucessivas alterações pontuais</strong>{' '}
            por leis ordinárias e complementares — sem uma revisão estrutural e
            sistemática. A revisão de 2026 propõe consolidar todas essas
            mudanças num texto único, modernizando os instrumentos urbanísticos
            e atualizando os parâmetros de uso e ocupação do solo.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Detalhes na Circular 001-2026, p. 2 (seção 3 — "Modernização do
            Plano e proposta de novo zoneamento").
          </p>
        </div>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Card de documento
// ---------------------------------------------------------------------------

function DocCard({ doc }: { doc: DocumentSummary }) {
  const photo = getDocPhoto(doc.id);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hero">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <PhotoCredit photo={photo} variant="overlay" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-atlantico-tinta backdrop-blur-sm">
          <FileText className="h-3 w-3" aria-hidden />
          PDF · {doc.totalPages} pp
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mar-profundo">
          {doc.publisher}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          {doc.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{doc.subtitle}</p>

        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
          {doc.abstract}
        </p>

        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            O que você vai entender
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
            {doc.whatYouLearn.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-atlantico-mar-raso"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/legislacao/${doc.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-atlantico-mar-raso px-4 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-atlantico-mar-profundo"
          >
            Navegar por seções
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <a
            href={doc.pdfPath}
            download={doc.pdfFilename}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-atlantico-mar-raso/40 hover:bg-muted/50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Baixar PDF · {doc.pdfSizeMB.toFixed(1)} MB
          </a>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Publicado em{' '}
          {new Date(doc.publishedAt).toLocaleDateString('pt-BR')} ·{' '}
          {doc.authors.length === 1
            ? `por ${doc.authors[0]}`
            : `por ${doc.authors.length} autoras/es`}
        </p>
      </div>
    </article>
  );
}

