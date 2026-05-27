/**
 * scripts/verify-rag.ts
 *
 * Teste end-to-end do pipeline RAG: embeda uma pergunta com Gemini
 * (taskType RETRIEVAL_QUERY) e chama match_chunks() no Supabase.
 *
 * Uso:
 *   npm run rag:verify -- "Posso construir um sobrado no centro?"
 *   npm run rag:verify -- "Qual o NDVI da macroárea Carneiros 1?" --k=8 --threshold=0.6
 *
 * Pré-requisitos:
 *   1. schema.sql + functions.sql aplicados no Supabase
 *   2. embed:docs já rodou e populou document_chunks
 *   3. .env.local com GEMINI_API_KEY + NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const positional = args.filter((a) => !a.startsWith('--'));
const question = positional.join(' ').trim();

const k = Number(flags.find((f) => f.startsWith('--k='))?.split('=')[1] ?? 5);
const threshold = Number(
  flags.find((f) => f.startsWith('--threshold='))?.split('=')[1] ?? 0.7,
);

async function main() {
  if (!question) {
    console.error('Uso: npm run rag:verify -- "pergunta entre aspas"');
    process.exit(2);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!geminiKey || !supaUrl || !supaKey) {
    console.error(
      'Faltam env vars: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY',
    );
    process.exit(1);
  }

  console.log(`\nPergunta: ${question}`);
  console.log(`k=${k}  threshold=${threshold}\n`);

  // 1. Embeddar a pergunta (taskType QUERY, não DOCUMENT)
  const genAI = new GoogleGenerativeAI(geminiKey);
  const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const { embedding } = await embedModel.embedContent({
    content: { role: 'user', parts: [{ text: question }] },
    taskType: TaskType.RETRIEVAL_QUERY,
  });

  // 2. match_chunks via RPC
  const supabase = createClient(supaUrl, supaKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding.values as unknown as string,
    match_threshold: threshold,
    match_count: k,
  });

  if (error) {
    console.error('match_chunks falhou:', error.message);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log('Sem matches acima do threshold. Tenta baixar --threshold=0.5.');
    return;
  }

  // 3. Imprime os top-k chunks
  for (const row of data) {
    const sim = Number(row.similarity).toFixed(3);
    const head = `[${row.source}, p.${row.page_number}] sim=${sim}`;
    console.log(`\n${head}`);
    console.log('─'.repeat(head.length));
    console.log(row.content.slice(0, 400) + (row.content.length > 400 ? '…' : ''));
  }
  console.log(`\n${data.length} chunks retornados.`);
}

main().catch((err) => {
  console.error('verify-rag falhou:', err.message);
  process.exit(1);
});
