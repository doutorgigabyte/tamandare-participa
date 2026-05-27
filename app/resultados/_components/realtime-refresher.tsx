'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Radio } from 'lucide-react';

/**
 * Componente invisível-na-maior-parte-do-tempo que assina mudanças em
 * `contributions` via Supabase Realtime. Quando uma INSERT acontece,
 * dispara `router.refresh()` — invalida o cache ISR de /resultados e
 * a página re-renderiza com os dados frescos.
 *
 * Substitui a estratégia ISR-only (que tinha lag de até 30s) por
 * atualização ao vivo. Funciona em paralelo com ISR (que continua como
 * fallback caso Realtime não esteja ativo).
 *
 * Mostra um indicador "ao vivo" pulsante quando conectado.
 */

const CHANNEL = 'contributions-realtime';

export function RealtimeRefresher() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'offline'>(
    'idle',
  );

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Se vars não configuradas ou ainda placeholder, nem tenta conectar.
    if (!url || !key || url.includes('your-project') || key.includes('REPLACE-ME')) {
      return;
    }

    setStatus('connecting');
    const supabase = createClient();

    const channel = supabase
      .channel(CHANNEL)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contributions' },
        () => {
          router.refresh();
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contributions' },
        (payload) => {
          // Só atualiza se o status mudou (aprovação/rejeição/spam)
          const oldStatus = (payload.old as { status?: string })?.status;
          const newStatus = (payload.new as { status?: string })?.status;
          if (oldStatus !== newStatus) router.refresh();
        },
      )
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') setStatus('live');
        else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('offline');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (status !== 'live') return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/40 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-medium text-emerald-300"
      aria-label="Atualizações ao vivo ativas"
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      Ao vivo
    </div>
  );
}
