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
      <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
        <p className="text-muted-foreground">
          O prazo de contribuição terminou. Você ainda pode acompanhar os
          resultados.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.15em] text-atlantico-mar-profundo">
        Tempo restante pra protocolar sua contribuição
      </p>
      <div className="grid grid-cols-4 gap-2 text-center sm:gap-3">
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
    <div className="rounded-lg bg-muted/60 p-3 sm:p-4">
      <div className="font-display text-2xl font-semibold tabular-nums text-atlantico-mar-profundo sm:text-3xl">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
