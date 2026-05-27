'use client';

import { useEffect, useState } from 'react';

/**
 * Countdown ao prazo de protocolação de contribuições.
 * PRD v1.0 §5.1.
 *
 * Alvo configurável via NEXT_PUBLIC_CONTRIBUTION_DEADLINE.
 * Default: 31/05/2026 23:59:59 (BRT, -03:00).
 */

const DEFAULT_DEADLINE = '2026-05-31T23:59:59-03:00';

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

function computeRemaining(target: number): Remaining {
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, total: diff };
}

export function Countdown() {
  const targetIso =
    process.env.NEXT_PUBLIC_CONTRIBUTION_DEADLINE ?? DEFAULT_DEADLINE;
  const target = new Date(targetIso).getTime();

  const [remaining, setRemaining] = useState<Remaining>(() =>
    computeRemaining(target),
  );

  useEffect(() => {
    const tick = () => setRemaining(computeRemaining(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining.total === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        <p className="text-zinc-300">
          O prazo de contribuição terminou. Você ainda pode acompanhar os
          resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <p className="mb-4 text-center text-xs uppercase tracking-widest text-zinc-400">
        Tempo restante pra protocolar sua contribuição
      </p>
      <div className="grid grid-cols-4 gap-3 text-center">
        <Unit label="Dias" value={remaining.days} />
        <Unit label="Horas" value={remaining.hours} />
        <Unit label="Minutos" value={remaining.minutes} />
        <Unit label="Segundos" value={remaining.seconds} />
      </div>
    </div>
  );
}

function Unit({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-950/60 p-3">
      <div
        className="font-mono text-2xl tabular-nums sm:text-3xl"
        style={{ color: '#00D9FF' }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  );
}
