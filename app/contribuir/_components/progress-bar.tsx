'use client';

import { cn } from '@/lib/utils';

const STEP_LABELS = [
  'Onde',
  'Tema',
  'Macroárea',
  'Contribuição',
  'Anexos',
  'Identificação',
  'Consentimento',
];

export function ProgressBar({
  current,
  total,
  onJump,
}: {
  /** Step atual, 1-based */
  current: number;
  /** Total de steps interativos (sem contar confirmação) */
  total: number;
  onJump: (step: number) => void;
}) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Etapa <span className="font-semibold text-foreground">{current}</span> de {total}
        </span>
        <span aria-hidden="true">{pct}%</span>
      </div>
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do formulário"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps clicáveis pra navegação backward — desktop only */}
      <ol className="mt-3 hidden flex-wrap gap-1 text-[11px] md:flex">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isPast = stepNum < current;
          const isCurrent = stepNum === current;
          const clickable = stepNum <= current;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => clickable && onJump(stepNum)}
                disabled={!clickable}
                className={cn(
                  'rounded px-2 py-1 transition',
                  isCurrent && 'bg-primary/15 font-semibold text-primary',
                  isPast && 'text-foreground hover:bg-muted',
                  !clickable && 'text-muted-foreground/60',
                )}
              >
                {stepNum}. {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
