/**
 * scripts/embed-docs.ts
 *
 * Pipeline de embedding dos documentos-fonte (Caderno ICR + Circular 001-2026)
 * pra base RAG do chat IA.
 *
 * Lê:    docs/sources/{caderno,circular}/*.md (frontmatter YAML + markdown)
 * Faz:   chunking semântico (~800 tokens, overlap ~100), respeitando H2/H3
 *        e marcadores <!-- page: N --> pra atribuição de página.
 * Gera:  embeddings via Gemini text-embedding-004 (vector 768).
 * Salva: document_chunks no Supabase via upsert idempotente
 *        on conflict (source, section, chunk_index).
 *
 * Uso:
 *   npm run embed:docs              -- pipeline completo
 *   npm run embed:dry               -- dry-run (sem API/DB)
 *   npx tsx scripts/embed-docs.ts --source=caderno   -- só um source
 *
 * Refs: PRD v1.0 §3.3 (pipeline) + §7.4 (chunking) + §6 (schema).
 */

import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import matter from 'gray-matter';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Config & CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SOURCE_FILTER = args
  .find((a) => a.startsWith('--source='))
  ?.split('=')[1] as 'caderno' | 'circular' | undefined;

const SOURCES_DIR = join(process.cwd(), 'docs', 'sources');

// PRD §3.3: "Chunking semântico (~800 tokens com overlap de 100)".
// Heurística PT-BR: ~4 chars/token. Conservador.
const CHARS_PER_TOKEN = 4;
const CHUNK_TARGET_TOKENS = 800;
const CHUNK_OVERLAP_TOKENS = 100;
const CHUNK_TARGET_CHARS = CHUNK_TARGET_TOKENS * CHARS_PER_TOKEN;
const CHUNK_OVERLAP_CHARS = CHUNK_OVERLAP_TOKENS * CHARS_PER_TOKEN;

const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIM = 768;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Frontmatter = {
  source: 'caderno' | 'circular';
  title: string;
  section_slug: string;
  page_start: number;
  page_end: number;
  toc_parent: string | null;
  authors: string[];
  publisher: string;
  document: string;
  extracted_at: string;
};

type Chunk = {
  source: string;
  section: string;
  chunk_index: number;
  page_number: number;
  content: string;
  metadata: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

async function listMarkdownFiles(): Promise<string[]> {
  const sources = SOURCE_FILTER ? [SOURCE_FILTER] : ['caderno', 'circular'];
  const all: string[] = [];
  for (const source of sources) {
    const dir = join(SOURCES_DIR, source);
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch (err) {
      console.warn(`[warn] diretório ausente: ${dir}`);
      continue;
    }
    for (const entry of entries) {
      if (entry.endsWith('.md')) all.push(join(dir, entry));
    }
  }
  return all.sort();
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

const PAGE_MARKER_RE = /<!--\s*page:\s*(\d+)\s*-->/g;

/**
 * Quebra o markdown em blocos lógicos, preservando:
 * - cabeçalhos (## / ###) começam novo bloco
 * - parágrafos (separados por linha em branco) são unidades
 * - cada bloco carrega a página atual (do último marcador visto)
 */
function splitIntoBlocks(
  markdown: string,
  startPage: number,
): { text: string; page: number; isHeading: boolean }[] {
  const lines = markdown.split('\n');
  const blocks: { text: string; page: number; isHeading: boolean }[] = [];
  let currentPage = startPage;
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join('\n').trim();
    if (text) {
      blocks.push({
        text,
        page: currentPage,
        isHeading: /^#{2,3}\s/.test(text),
      });
    }
    buffer = [];
  };

  for (const line of lines) {
    // Atualiza página corrente a partir de marcadores
    const pageMatch = line.match(/<!--\s*page:\s*(\d+)\s*-->/);
    if (pageMatch) {
      flush();
      currentPage = Number(pageMatch[1]);
      continue;
    }
    // Cabeçalho H2/H3 → novo bloco
    if (/^#{2,3}\s/.test(line)) {
      flush();
      buffer.push(line);
      continue;
    }
    // Linha em branco → fim de bloco
    if (line.trim() === '') {
      flush();
      continue;
    }
    buffer.push(line);
  }
  flush();
  return blocks;
}

/**
 * Agrega blocos em chunks aproximando o tamanho-alvo.
 * Inclui overlap dos últimos ~CHUNK_OVERLAP_CHARS do chunk anterior pra
 * preservar contexto entre fronteiras.
 * Cada chunk carrega a página de início (primeiro bloco que entrou).
 */
function aggregateBlocks(
  blocks: { text: string; page: number; isHeading: boolean }[],
  headerContext: string,
): { text: string; page: number }[] {
  const chunks: { text: string; page: number }[] = [];
  let current = '';
  let currentPage: number | null = null;
  let lastHeading = '';

  for (const block of blocks) {
    // Cabeçalho vira contexto pros próximos blocos (carry-on)
    if (block.isHeading) {
      // Cabeçalho sozinho não vira chunk — guarda como contexto
      lastHeading = block.text;
      // Se já tinha conteúdo acumulado, fecha chunk antes
      if (current && current.length >= CHUNK_TARGET_CHARS * 0.5) {
        chunks.push({ text: current.trim(), page: currentPage! });
        current = '';
        currentPage = null;
      }
      continue;
    }

    const prefix = current ? '\n\n' : `${headerContext}${lastHeading ? lastHeading + '\n\n' : ''}`;
    const candidate = current + prefix + block.text;

    if (candidate.length <= CHUNK_TARGET_CHARS) {
      if (!current) currentPage = block.page;
      current = candidate;
    } else {
      // Fecha chunk corrente
      if (current) chunks.push({ text: current.trim(), page: currentPage! });
      // Overlap: pega últimos CHUNK_OVERLAP_CHARS do anterior pra começar o próximo
      const overlap = current.slice(-CHUNK_OVERLAP_CHARS);
      const overlapAtParagraph = overlap.indexOf('\n\n');
      const overlapClean = overlapAtParagraph >= 0
        ? overlap.slice(overlapAtParagraph + 2)
        : overlap;
      current = `${headerContext}${lastHeading ? lastHeading + '\n\n' : ''}${overlapClean ? overlapClean + '\n\n' : ''}${block.text}`;
      currentPage = block.page;
    }
  }
  if (current) chunks.push({ text: current.trim(), page: currentPage! });
  return chunks;
}

function chunkMarkdown(meta: Frontmatter, content: string): Chunk[] {
  // Header context: prefixa cada chunk com título da seção pra dar ancoragem semântica
  const headerContext = `# ${meta.title}\n\n`;
  const blocks = splitIntoBlocks(content, meta.page_start);
  const raw = aggregateBlocks(blocks, headerContext);

  return raw.map((c, idx) => ({
    source: meta.source,
    section: meta.section_slug,
    chunk_index: idx,
    page_number: c.page,
    content: c.text,
    metadata: {
      title: meta.title,
      toc_parent: meta.toc_parent,
      publisher: meta.publisher,
      document: meta.document,
      page_start: meta.page_start,
      page_end: meta.page_end,
      authors: meta.authors,
      char_count: c.text.length,
      est_token_count: Math.round(c.text.length / CHARS_PER_TOKEN),
    },
  }));
}

// ---------------------------------------------------------------------------
// Embedding (Gemini)
// ---------------------------------------------------------------------------

async function embedAll(chunks: Chunk[], apiKey: string): Promise<number[][]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const out: number[][] = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const title = String(c.metadata.title ?? '');
    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text: c.content }] },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title,
    });
    const vec = result.embedding.values;
    if (!vec || vec.length !== EMBEDDING_DIM) {
      throw new Error(
        `embedding dimension mismatch on chunk ${i}: got ${vec?.length}, expected ${EMBEDDING_DIM}`,
      );
    }
    out.push(vec);
    process.stdout.write('.');
    // Pacing leve pra ficar bem abaixo do limite (1500 RPM no free tier)
    if ((i + 1) % 50 === 0) await new Promise((r) => setTimeout(r, 250));
  }
  process.stdout.write('\n');
  return out;
}

// ---------------------------------------------------------------------------
// Persistência (Supabase)
// ---------------------------------------------------------------------------

function supabase(url: string, serviceKey: string) {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function upsertChunks(
  client: ReturnType<typeof supabase>,
  chunks: Chunk[],
  vectors: number[][],
): Promise<void> {
  if (chunks.length === 0) return;
  const rows = chunks.map((c, i) => ({
    source: c.source,
    section: c.section,
    chunk_index: c.chunk_index,
    page_number: c.page_number,
    content: c.content,
    embedding: vectors[i] as unknown as string, // supabase-js serializa array → pgvector
    metadata: c.metadata,
  }));
  const { error } = await client
    .from('document_chunks')
    .upsert(rows, { onConflict: 'source,section,chunk_index' });
  if (error) throw new Error(`supabase upsert failed: ${error.message}`);
}

async function deleteStale(
  client: ReturnType<typeof supabase>,
  source: string,
  section: string,
  maxIndex: number,
): Promise<number> {
  const { error, count } = await client
    .from('document_chunks')
    .delete({ count: 'exact' })
    .eq('source', source)
    .eq('section', section)
    .gt('chunk_index', maxIndex);
  if (error) throw new Error(`supabase delete failed: ${error.message}`);
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    `[embed-docs] modo: ${DRY_RUN ? 'DRY-RUN' : 'LIVE'}` +
      (SOURCE_FILTER ? ` | filtro: --source=${SOURCE_FILTER}` : ''),
  );

  // Env vars (só validamos em modo LIVE)
  const geminiKey = process.env.GEMINI_API_KEY;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!DRY_RUN) {
    if (!geminiKey) throw new Error('GEMINI_API_KEY ausente em .env.local');
    if (!supaUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL ausente em .env.local');
    if (!supaKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente em .env.local');
  }

  const files = await listMarkdownFiles();
  console.log(`[embed-docs] ${files.length} arquivos encontrados`);

  let totalChunks = 0;
  let totalChars = 0;
  let totalStaleDeleted = 0;
  const summary: { file: string; chunks: number; tokens: number }[] = [];

  const client = !DRY_RUN ? supabase(supaUrl!, supaKey!) : null;

  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const { data, content } = matter(raw);
    const meta = data as Frontmatter;

    const chunks = chunkMarkdown(meta, content);
    const chars = chunks.reduce((a, c) => a + c.content.length, 0);
    const tokens = Math.round(chars / CHARS_PER_TOKEN);

    summary.push({
      file: file.replace(process.cwd(), '.').replace(/\\/g, '/'),
      chunks: chunks.length,
      tokens,
    });
    totalChunks += chunks.length;
    totalChars += chars;

    if (DRY_RUN) continue;

    console.log(
      `\n[${meta.source}/${meta.section_slug}] ${chunks.length} chunks, ${tokens} tokens — embedding...`,
    );
    const vectors = await embedAll(chunks, geminiKey!);
    await upsertChunks(client!, chunks, vectors);
    const stale = await deleteStale(
      client!,
      meta.source,
      meta.section_slug,
      chunks.length - 1,
    );
    totalStaleDeleted += stale;
    if (stale > 0) console.log(`  ↳ removidos ${stale} chunks obsoletos`);
  }

  // Relatório
  console.log('\n──────────── Resumo ────────────');
  console.table(summary);
  const totalTokens = Math.round(totalChars / CHARS_PER_TOKEN);
  console.log(
    `Total: ${totalChunks} chunks · ~${totalTokens.toLocaleString('pt-BR')} tokens · ~${(totalChars / 1024).toFixed(1)} KiB`,
  );
  if (!DRY_RUN) {
    console.log(`Chunks obsoletos removidos: ${totalStaleDeleted}`);
    console.log(`Custo estimado Gemini (text-embedding-004): grátis no free tier.`);
  } else {
    console.log('(dry-run — nada foi gravado no Supabase nem chamada ao Gemini)');
  }
}

main().catch((err) => {
  console.error('[embed-docs] FALHOU:', err.message);
  process.exit(1);
});
