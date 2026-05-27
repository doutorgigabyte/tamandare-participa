import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { TaskType } from '@google/generative-ai';
import { chatPostSchema, formatChatErrors } from '@/lib/chat/schema';
import {
  buildPromptWithContext,
  NO_MATCHES_RESPONSE,
  type RetrievedChunk,
} from '@/lib/chat/prompt';
import type {
  ChatPostError,
  ChatPostResponse,
  Citation,
  DocumentSource,
} from '@/lib/chat/types';
import { gemini, GEMINI_EMBEDDING_MODEL } from '@/lib/gemini/client';
import { SYSTEM_PROMPT } from '@/lib/gemini/system-prompt';
import { gateway } from '@/lib/gateway/client';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * POST /api/chat
 * Pipeline RAG: embed query → match_chunks → gateway.llm.chat() → persiste.
 *
 * PRD v1.0 §7.3.
 *
 * Decisões pra MVP 1:
 *   - Sem streaming (Gateway não suporta; ver doc Gateway §6.3). Streaming
 *     entra no MVP 2 via SDK direto.
 *   - Sem histórico no LLM. Cada pergunta é tratada como turno independente.
 *     Query rewriting + multi-turn coerente = MVP 2.
 *   - 0 chunks acima do threshold → resposta canned (NO_MATCHES_RESPONSE)
 *     sem gastar tokens do LLM.
 */

const MATCH_THRESHOLD = 0.65;
const MATCH_COUNT = 5;
const EXCERPT_LEN = 200;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function errorResponse(
  body: ChatPostError,
  status: number,
): NextResponse<ChatPostError> {
  return NextResponse.json(body, { status });
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url
      && key
      && !url.includes('your-project')
      && !key.includes('REPLACE-ME'),
  );
}

export async function POST(req: NextRequest) {
  // 1. Parse + validate
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return errorResponse(
      { error: 'invalid_json', detail: 'Corpo da requisição não é JSON válido.' },
      400,
    );
  }

  let input;
  try {
    input = chatPostSchema.parse(rawBody);
  } catch (err) {
    if (err instanceof ZodError) {
      return errorResponse(
        {
          error: 'validation_failed',
          detail: 'Pergunta inválida.',
          field_errors: formatChatErrors(err),
        },
        422,
      );
    }
    throw err;
  }

  // 2. Supabase guard — sem banco, sem RAG.
  if (!isSupabaseConfigured()) {
    return errorResponse(
      {
        error: 'infra_pending',
        detail:
          'Base RAG ainda não configurada. O chat estará disponível assim que aplicarmos o schema no Supabase.',
      },
      503,
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return errorResponse(
      {
        error: 'infra_pending',
        detail: 'Embeddings indisponíveis (GEMINI_API_KEY ausente).',
      },
      503,
    );
  }

  // 3. Embed da pergunta (Gemini SDK direto — Gateway não tem endpoint de embedding)
  const embedModel = gemini.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
  const embedResult = await embedModel.embedContent({
    content: { role: 'user', parts: [{ text: input.message }] },
    taskType: TaskType.RETRIEVAL_QUERY,
  });
  const queryEmbedding = embedResult.embedding.values;

  // 4. Match chunks
  const supabase = createServiceClient();
  const { data: chunks, error: matchErr } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding as unknown as string,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
  });

  if (matchErr) {
    // eslint-disable-next-line no-console
    console.error('[chat] match_chunks falhou:', matchErr);
    return errorResponse(
      { error: 'db_error', detail: 'Falha ao buscar contexto.' },
      500,
    );
  }

  const retrievedChunks: RetrievedChunk[] = (chunks ?? []).map((c: {
    id: number;
    content: string;
    source: string;
    page_number: number | null;
    similarity: number;
  }) => ({
    id: c.id,
    content: c.content,
    source: c.source as DocumentSource,
    page_number: c.page_number,
    similarity: c.similarity,
  }));

  // 5. Garantir sessão (anônima ok)
  let sessionId: string | null = input.session_id ?? null;
  if (!sessionId) {
    const { data: newSession, error: sessionErr } = await supabase
      .from('chat_sessions')
      .insert({ anon_session_id: crypto.randomUUID() })
      .select('id')
      .single();
    if (sessionErr) {
      // eslint-disable-next-line no-console
      console.error('[chat] criar sessão falhou:', sessionErr);
      return errorResponse(
        { error: 'db_error', detail: 'Falha ao iniciar sessão.' },
        500,
      );
    }
    sessionId = newSession.id as string;
  }
  // Aqui sessionId é garantidamente string (não-null) — input.session_id era
  // válido (passou pelo Zod uuid) OU acabamos de criar uma nova session.
  const finalSessionId: string = sessionId!;

  // 6. Persiste mensagem do usuário
  await supabase.from('chat_messages').insert({
    session_id: finalSessionId,
    role: 'user',
    content: input.message,
  });

  // 7. Gera resposta
  let responseText: string;
  let viaGateway = false;
  let tokensUsed: number | null = null;

  if (retrievedChunks.length === 0) {
    responseText = NO_MATCHES_RESPONSE;
  } else {
    const promptText = buildPromptWithContext(input.message, retrievedChunks);
    try {
      const result = await gateway.llm.chat({
        messages: [{ role: 'user', content: promptText }],
        systemPrompt: SYSTEM_PROMPT,
        model: 'gemini-2.5-flash',
        temperature: 0.4,
        maxTokens: 1024,
      });
      responseText = result.content;
      viaGateway = result.viaGateway;
      tokensUsed = Number(result.metadata?.tokensOutput) || null;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[chat] LLM falhou:', (err as Error).message);
      return errorResponse(
        {
          error: 'llm_failed',
          detail:
            'Falha ao gerar resposta. Tente novamente em instantes ou reformule a pergunta.',
        },
        502,
      );
    }
  }

  // 8. Persiste mensagem do assistant + cited_chunks
  const citedIds = retrievedChunks.map((c) => c.id);
  const { data: assistantMsg, error: assistantErr } = await supabase
    .from('chat_messages')
    .insert({
      session_id: finalSessionId,
      role: 'assistant',
      content: responseText,
      cited_chunks: citedIds,
      tokens_used: tokensUsed,
    })
    .select('id, created_at')
    .single();

  if (assistantErr) {
    // eslint-disable-next-line no-console
    console.error('[chat] persistir assistant falhou:', assistantErr);
    // Não retorna erro pro user — a resposta já está gerada, só perdeu o log.
  }

  // 9. Monta citations pro frontend
  const citations: Citation[] = retrievedChunks.map((c) => ({
    chunk_id: c.id,
    source: c.source,
    page_number: c.page_number,
    similarity: Number(c.similarity.toFixed(3)),
    excerpt:
      c.content.length > EXCERPT_LEN
        ? c.content.slice(0, EXCERPT_LEN) + '…'
        : c.content,
  }));

  const responseBody: ChatPostResponse = {
    session_id: finalSessionId,
    message: {
      id: assistantMsg?.id ?? -1,
      session_id: finalSessionId,
      role: 'assistant',
      content: responseText,
      citations,
      created_at: assistantMsg?.created_at ?? new Date().toISOString(),
    },
    citations,
    via_gateway: viaGateway,
  };

  return NextResponse.json(responseBody, { status: 200 });
}
