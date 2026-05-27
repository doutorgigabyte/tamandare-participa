/**
 * lib/docs/sources.ts
 *
 * Fonte de verdade dos documentos oficiais da revisão do Plano Diretor.
 *
 * Os PDFs originais estão em `public/docs/` (servidos pelo Next) e os
 * conteúdos extraídos + segmentados em .md ficam em `docs/sources/` com
 * frontmatter YAML (page_start, page_end, authors, etc.).
 *
 * Esta lib parsea os .md e expõe um modelo navegável pelo front-end.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { PHOTOS, type PhotoKey } from '@/lib/images/photos';

// ---------------------------------------------------------------------------
// Modelo
// ---------------------------------------------------------------------------

export type DocId = 'circular' | 'caderno';

export type DocumentSummary = {
  id: DocId;
  slug: string;
  title: string;
  subtitle: string;
  authors: string[];
  publisher: string;
  /** Caminho do PDF em `/public/docs/...` */
  pdfPath: string;
  pdfFilename: string;
  pdfSizeMB: number;
  totalPages: number;
  publishedAt: string; // ISO date
  photoKey: PhotoKey;
  abstract: string;
  /** Resumo do que o documento permite ao cidadão entender */
  whatYouLearn: string[];
};

export type DocSection = {
  doc: DocId;
  slug: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  authors: string[];
  /** MD bruto */
  raw: string;
  /** HTML renderizado (server-side) */
  html: string;
  /** Primeiros ~280 caracteres do MD (pra resumos) */
  excerpt: string;
};

// ---------------------------------------------------------------------------
// Metadados estáticos (não estão nos .md frontmatter por serem do PDF, não da seção)
// ---------------------------------------------------------------------------

export const DOCUMENTS: Record<DocId, DocumentSummary> = {
  circular: {
    id: 'circular',
    slug: 'circular',
    title: 'Circular 001-2026',
    subtitle: 'Convocação oficial da Audiência Pública de revisão do Plano Diretor',
    authors: ['Prefeitura Municipal de Tamandaré'],
    publisher: 'Prefeitura Municipal de Tamandaré',
    pdfPath: '/docs/circular-001-2026.pdf',
    pdfFilename: 'circular-001-2026.pdf',
    pdfSizeMB: 4.14,
    totalPages: 43,
    publishedAt: '2026-05-12',
    photoKey: 'igrejaSaoPedro',
    abstract:
      'Documento oficial que convoca a população para a Audiência Pública de revisão do Plano Diretor, apresenta a proposta preliminar de novo zoneamento (10 macroáreas + zonas especiais) e explica o cronograma de protocolo de contribuições.',
    whatYouLearn: [
      'Como participar oficialmente da revisão e protocolar contribuições',
      'Quais são as 10 macroáreas propostas e o que cada uma representa',
      'Qual é o cronograma legal e o prazo final pra protocolar',
      'Quais leis serão consolidadas e modernizadas (Lei 184/2002 e alterações)',
    ],
  },
  caderno: {
    id: 'caderno',
    slug: 'caderno',
    title: 'Análise Preliminar do Plano Diretor',
    subtitle: 'Estudo técnico do Instituto Cidades Responsivas (ICR)',
    authors: [
      'Luciana Fonseca',
      'Leonardo Hortencio',
      'Luís Henrique Villanova',
      'Guilherme Dalcin',
      'Luiza Moraes',
      'Gabriela Kwasniewski',
    ],
    publisher: 'Instituto Cidades Responsivas',
    pdfPath: '/docs/caderno-icr-analise-preliminar.pdf',
    pdfFilename: 'caderno-icr-analise-preliminar.pdf',
    pdfSizeMB: 14.17,
    totalPages: 69,
    publishedAt: '2026-04-15',
    photoKey: 'forteSantoInacio',
    abstract:
      'Consultoria em Planejamento Urbano Estratégico que diagnostica os instrumentos vigentes (Lei 184/2002), analisa a Lei de Uso e Ocupação do Solo, propõe indicadores de desempenho urbano (habitação, mobilidade, emprego, vegetação, patrimônio) e avalia a maturidade digital da gestão municipal.',
    whatYouLearn: [
      'O que cada parâmetro construtivo (gabarito, taxa de ocupação, recuo) significa na prática',
      'Como o plano atual impacta sua rua e o que muda na proposta',
      '5 indicadores comparando Tamandaré com cidades similares do Brasil',
      'Onde e por que vegetação, patrimônio histórico e mobilidade precisam de atenção',
    ],
  },
};

export const DOCS_LIST = Object.values(DOCUMENTS);

// ---------------------------------------------------------------------------
// Leitura das seções
// ---------------------------------------------------------------------------

const SOURCES_DIR = join(process.cwd(), 'docs', 'sources');

function sectionsDir(doc: DocId): string {
  return join(SOURCES_DIR, doc);
}

function mdToHtml(md: string): string {
  // Limpa marcadores `<!-- page: N -->` antes de renderizar — eles são metadados,
  // não conteúdo legível. Mas mantemos pra que o renderer use depois (anchor).
  const withAnchors = md.replace(
    /<!--\s*page:\s*(\d+)\s*-->/g,
    (_, p) =>
      `<a id="page-${p}" class="doc-page-anchor" data-page="${p}" aria-label="Página ${p} do documento"></a>`,
  );
  return marked.parse(withAnchors, { async: false }) as string;
}

function makeExcerpt(md: string): string {
  // Remove headers, comentários, anchors — pega primeiro parágrafo de texto.
  const cleaned = md
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^#+\s.*$/gm, '')
    .replace(/^\s*[-*]\s/gm, '')
    .trim();
  const firstPara = cleaned.split(/\n\n+/).find((p) => p.trim().length > 20) ?? '';
  if (firstPara.length <= 280) return firstPara;
  return firstPara.slice(0, 277) + '…';
}

/**
 * Lista todas as seções de um documento, em ordem natural do filename.
 */
export function getDocSections(doc: DocId): DocSection[] {
  const dir = sectionsDir(doc);
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  files.sort(); // os arquivos do caderno são 00-..., 01-..., garantindo ordem

  return files.map((file) => {
    const raw = readFileSync(join(dir, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = (data.section_slug as string) ?? file.replace(/\.md$/, '');
    return {
      doc,
      slug,
      title: (data.title as string) ?? slug,
      pageStart: Number(data.page_start ?? 1),
      pageEnd: Number(data.page_end ?? 1),
      authors: (data.authors as string[]) ?? [],
      raw: content,
      html: mdToHtml(content),
      excerpt: makeExcerpt(content),
    };
  });
}

/**
 * Retorna uma seção específica, ou null se não existir.
 */
export function getDocSection(doc: DocId, sectionSlug: string): DocSection | null {
  const sections = getDocSections(doc);
  return sections.find((s) => s.slug === sectionSlug) ?? null;
}

// ---------------------------------------------------------------------------
// Helpers de URL
// ---------------------------------------------------------------------------

/**
 * Deep link pro PDF do documento numa página específica.
 * Funciona em Chrome/Edge/Firefox e na maioria dos PDF viewers — o fragment
 * `#page=N` é padrão Adobe PDF Open Parameters.
 */
export function pdfPageUrl(doc: DocId, page: number): string {
  return `${DOCUMENTS[doc].pdfPath}#page=${page}`;
}

/**
 * Helper pra mostrar a foto da capa de um documento.
 */
export function getDocPhoto(doc: DocId) {
  return PHOTOS[DOCUMENTS[doc].photoKey];
}
