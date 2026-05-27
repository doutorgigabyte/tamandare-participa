import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Download,
  ArrowLeft,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  DOCUMENTS,
  getDocSections,
  type DocId,
} from '@/lib/docs/sources';
import { getDocCover } from '@/lib/docs/images';

const DOC_IDS: DocId[] = ['circular', 'caderno'];

export function generateStaticParams() {
  return DOC_IDS.map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: { doc: string };
}) {
  if (!DOC_IDS.includes(params.doc as DocId)) {
    return { title: 'Documento não encontrado' };
  }
  const d = DOCUMENTS[params.doc as DocId];
  return {
    title: `${d.title} · ${d.publisher}`,
    description: d.abstract.slice(0, 160),
  };
}

export default function DocumentPage({
  params,
}: {
  params: { doc: string };
}) {
  if (!DOC_IDS.includes(params.doc as DocId)) {
    notFound();
  }
  const docId = params.doc as DocId;
  const doc = DOCUMENTS[docId];
  const cover = getDocCover(docId);
  const sections = getDocSections(docId);

  return (
    <main className="flex min-h-screen flex-col">
      {/* HEADER COM CAPA DO PDF */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[360px] sm:h-[460px]">
          {cover && (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-atlantico-tinta/80 via-atlantico-tinta/55 to-atlantico-tinta/30"
          />
          {cover && (
            <span className="absolute bottom-2 right-2 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
              {cover.caption} · {cover.credit}
            </span>
          )}

          <div className="absolute inset-0 z-10 flex items-end">
            <div className="container mx-auto px-4 pb-10 sm:pb-14">
              <Link
                href="/legislacao"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Todos os documentos
              </Link>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/80">
                {doc.publisher}
              </p>
              <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                {doc.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
                {doc.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AÇÕES + RESUMO */}
      <section className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={doc.pdfPath}
              download={doc.pdfFilename}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-atlantico-mar-raso px-5 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-atlantico-mar-profundo"
            >
              <Download className="h-4 w-4" aria-hidden />
              Baixar PDF · {doc.pdfSizeMB.toFixed(1)} MB · {doc.totalPages} páginas
            </a>
            <a
              href={doc.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-all hover:border-atlantico-mar-raso/40 hover:bg-muted/50"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Abrir no navegador
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mar-profundo">
              Sobre este documento
            </p>
            <p className="mt-2 text-base leading-relaxed text-foreground/90">
              {doc.abstract}
            </p>

            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Autoria
                </p>
                <p className="mt-1 text-foreground">
                  {doc.authors.length <= 2
                    ? doc.authors.join(' e ')
                    : `${doc.authors[0]} e ${doc.authors.length - 1} outros`}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Publicação
                </p>
                <p className="mt-1 text-foreground">
                  {new Date(doc.publishedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUMÁRIO / SEÇÕES */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {sections.length > 1 ? 'Sumário' : 'Conteúdo'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {sections.length} {sections.length === 1 ? 'seção' : 'seções'}
            </p>
          </div>

          {sections.length === 0 ? (
            <p className="rounded-lg border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              Conteúdo deste documento ainda não foi extraído. Baixe o PDF
              acima para acessar.
            </p>
          ) : (
            <ol className="space-y-3">
              {sections.map((section, idx) => (
                <li key={section.slug}>
                  <Link
                    href={`/legislacao/${doc.slug}/${section.slug}`}
                    className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-atlantico-mar-raso/40 hover:shadow-card sm:flex-row sm:gap-5 sm:p-6"
                  >
                    <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
                      <span className="font-display text-3xl font-semibold leading-none text-atlantico-mar-raso sm:text-4xl">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        pp. {section.pageStart}
                        {section.pageEnd > section.pageStart &&
                          `–${section.pageEnd}`}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold leading-tight text-foreground sm:text-xl">
                        {section.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {section.excerpt}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-atlantico-mar-profundo group-hover:gap-2.5 transition-all">
                        Ler seção
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
}
