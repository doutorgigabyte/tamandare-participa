import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Send,
} from 'lucide-react';
import {
  DOCUMENTS,
  getDocSections,
  getDocSection,
  pdfPageUrl,
  type DocId,
} from '@/lib/docs/sources';
import { getSectionImages } from '@/lib/docs/images';

const DOC_IDS: DocId[] = ['circular', 'caderno'];

export function generateStaticParams() {
  const params: { doc: string; secao: string }[] = [];
  for (const doc of DOC_IDS) {
    for (const section of getDocSections(doc)) {
      params.push({ doc, secao: section.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { doc: string; secao: string };
}) {
  if (!DOC_IDS.includes(params.doc as DocId)) return { title: 'Não encontrado' };
  const section = getDocSection(params.doc as DocId, params.secao);
  if (!section) return { title: 'Seção não encontrada' };
  const docName = DOCUMENTS[params.doc as DocId].title;
  return {
    title: `${section.title} · ${docName}`,
    description: section.excerpt.slice(0, 160),
  };
}

export default function DocSectionPage({
  params,
}: {
  params: { doc: string; secao: string };
}) {
  if (!DOC_IDS.includes(params.doc as DocId)) notFound();
  const docId = params.doc as DocId;
  const doc = DOCUMENTS[docId];
  const sections = getDocSections(docId);
  const section = getDocSection(docId, params.secao);
  if (!section) notFound();

  const idx = sections.findIndex((s) => s.slug === section.slug);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
  const images = getSectionImages(docId, section.slug);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* BREADCRUMB */}
          <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Link href="/legislacao" className="hover:text-foreground">
              Legislação
            </Link>
            <span aria-hidden>›</span>
            <Link
              href={`/legislacao/${doc.slug}`}
              className="hover:text-foreground"
            >
              {doc.title}
            </Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">{section.title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* CONTEÚDO */}
            <article>
              <header className="mb-8 border-b border-border pb-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mar-profundo">
                  {doc.publisher} · {doc.title}
                </p>
                <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                  {section.title}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Páginas {section.pageStart}
                  {section.pageEnd > section.pageStart &&
                    `–${section.pageEnd}`}{' '}
                  do PDF original.{' '}
                  <a
                    href={pdfPageUrl(docId, section.pageStart)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline"
                  >
                    Abrir no PDF
                  </a>
                </p>
              </header>

              {images.length > 0 && (
                <div className="mb-8 space-y-6">
                  {images.map((img) => (
                    <figure
                      key={img.src}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                    >
                      <div className="relative w-full bg-muted/40">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          width={1600}
                          height={1000}
                          className="h-auto w-full object-contain"
                          sizes="(max-width: 1024px) 100vw, 800px"
                        />
                      </div>
                      <figcaption className="border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:text-sm">
                        <span className="font-medium text-foreground">
                          {img.caption}
                        </span>
                        <span className="mx-1.5 text-border">·</span>
                        <a
                          href={pdfPageUrl(docId, img.page)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-atlantico-mar-profundo hover:underline"
                        >
                          PDF p. {img.page}
                        </a>
                        <span className="mx-1.5 text-border">·</span>
                        <span>{img.credit}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}

              <div
                className="doc-prose"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />

              {/* CTA INLINE — contribuir sobre esta seção */}
              <div className="mt-12 rounded-2xl border border-atlantico-mata-clara/60 bg-atlantico-mata-clara/20 p-6 sm:p-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-atlantico-mata-atlantica">
                  Tem opinião sobre este tema?
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                  Sua contribuição entra no relatório oficial.
                </h3>
                <p className="mt-2 text-sm text-foreground/80 sm:text-base">
                  Não é preciso ler o Plano inteiro pra opinar — basta um
                  parágrafo dizendo o que você acha desta seção específica.
                </p>
                <Link
                  href="/contribuir"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-atlantico-mata-atlantica px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:opacity-90"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Contribuir
                </Link>
              </div>

              {/* NAVEGAÇÃO PREV/NEXT */}
              <nav className="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
                {prev ? (
                  <Link
                    href={`/legislacao/${doc.slug}/${prev.slug}`}
                    className="group flex flex-1 flex-col items-start rounded-xl border border-border p-4 transition-colors hover:border-atlantico-mar-raso/40 hover:bg-muted/40"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ArrowLeft className="h-3 w-3" aria-hidden />
                      Seção anterior
                    </span>
                    <span className="mt-1 text-sm font-medium text-foreground">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link
                    href={`/legislacao/${doc.slug}/${next.slug}`}
                    className="group flex flex-1 flex-col items-end rounded-xl border border-border p-4 text-right transition-colors hover:border-atlantico-mar-raso/40 hover:bg-muted/40"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      Próxima seção
                      <ArrowRight className="h-3 w-3" aria-hidden />
                    </span>
                    <span className="mt-1 text-sm font-medium text-foreground">
                      {next.title}
                    </span>
                  </Link>
                )}
              </nav>
            </article>

            {/* SIDEBAR — TOC + downloads */}
            <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <FileText className="h-4 w-4 text-atlantico-mar-profundo" />
                  <span className="text-sm font-medium text-foreground">
                    Documento
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {doc.publisher}
                </p>
                <p className="mt-1 font-display text-base font-semibold leading-tight text-foreground">
                  {doc.title}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {doc.totalPages} páginas · PDF {doc.pdfSizeMB.toFixed(1)} MB
                </p>
                <div className="mt-4 space-y-2">
                  <a
                    href={doc.pdfPath}
                    download={doc.pdfFilename}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-atlantico-mar-raso px-3 py-2 text-xs font-medium text-white hover:bg-atlantico-mar-profundo"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    Baixar PDF
                  </a>
                  <a
                    href={pdfPageUrl(docId, section.pageStart)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    Abrir pág. {section.pageStart}
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Sumário
                </p>
                <ol className="mt-3 space-y-1.5">
                  {sections.map((s, i) => {
                    const isCurrent = s.slug === section.slug;
                    return (
                      <li key={s.slug}>
                        <Link
                          href={`/legislacao/${doc.slug}/${s.slug}`}
                          className={`block rounded-md px-2 py-1.5 text-xs transition-colors ${
                            isCurrent
                              ? 'bg-atlantico-mar-raso/10 font-medium text-atlantico-mar-profundo'
                              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                          }`}
                        >
                          <span className="font-mono text-[10px] opacity-60">
                            {String(i + 1).padStart(2, '0')}.
                          </span>{' '}
                          {s.title}
                          <span className="ml-1 text-[10px] opacity-60">
                            (p. {s.pageStart})
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
