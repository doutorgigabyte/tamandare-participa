import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Cliente Supabase pra Server Components e Route Handlers.
 * Lê/escreve cookies via next/headers (SSR-safe).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // chamado de Server Component sem middleware refresh — pode ignorar
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // idem
          }
        },
      },
    },
  );
}

/**
 * Cliente Supabase com SERVICE ROLE — bypassa RLS.
 * USAR APENAS em route handlers que precisam de privilégios elevados
 * (ex: inserts em cache, leituras agregadas, jobs administrativos, RPCs
 * sobre tabelas com RLS).
 *
 * IMPORTANTE: usa `createClient` puro do `@supabase/supabase-js`, NÃO o
 * `createServerClient` do `@supabase/ssr`. O ssr-client é otimizado pra
 * cookies/middleware de usuário autenticado — passar service_role pra ele
 * resulta em chamadas que NÃO bypassam RLS em prod (testado em 2026-05-28:
 * match_chunks RPC retornava 0 em prod mas funcionava no script local com
 * createClient puro).
 */
export function createServiceClient() {
  return createPlainClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
