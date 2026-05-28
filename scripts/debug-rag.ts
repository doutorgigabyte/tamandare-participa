/**
 * Debug RAG: roda a query "Por que reduziram o gabarito em Carneiros?"
 * passando pelo embedding + match_chunks com threshold baixo (0.10)
 * pra ver as similarities reais. Descarte após uso.
 */
import { createClient } from '@supabase/supabase-js';

async function main() {
  const geminiKey = process.env.GEMINI_API_KEY!;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const query = 'Por que reduziram o gabarito em Carneiros?';
  console.log('Query:', query, '\n');

  // 1) Embed
  const embRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text: query }] },
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: 768,
      }),
    },
  );
  const embData = (await embRes.json()) as { embedding?: { values?: number[] } };
  const vec = embData.embedding?.values;
  if (!vec) {
    console.error('embedding falhou:', JSON.stringify(embData).slice(0, 300));
    return;
  }
  console.log(`embedding ok: ${vec.length} dims\n`);

  // 2) Match com threshold baixíssimo pra ver similarities reais
  const supa = createClient(supaUrl, supaKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supa.rpc('match_chunks', {
    query_embedding: vec as unknown as string,
    match_threshold: 0.1,
    match_count: 20,
  });
  if (error) {
    console.error('match_chunks erro:', error);
    return;
  }
  console.log(`Top ${(data ?? []).length} matches:`);
  for (const r of data as Array<{
    id: number;
    source: string;
    page_number: number;
    similarity: number;
    content: string;
  }>) {
    console.log(
      `  [${r.source} p.${r.page_number}] id=${r.id} sim=${r.similarity.toFixed(4)} — ${r.content.replace(/\s+/g, ' ').slice(0, 80)}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
