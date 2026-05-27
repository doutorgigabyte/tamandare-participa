'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Cliente Supabase pra Client Components.
 * Usa a anon key (RLS aplicado).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
