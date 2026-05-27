'use client';

import { CATEGORY_CONFIG } from '@/lib/contribution/categories';
import type { Category } from '@/lib/contribution/types';
import { cn } from '@/lib/utils';

export function StepCategory({
  value,
  onChange,
  errors,
}: {
  value: Category | null;
  onChange: (c: Category) => void;
  errors: Record<string, string>;
}) {
  const err = errors.category;
  return (
    <fieldset className="space-y-4">
      <legend>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          2. Sobre o quê?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha o tema mais próximo da sua contribuição.
        </p>
      </legend>

      <div
        role="radiogroup"
        aria-label="Categoria da contribuição"
        aria-invalid={Boolean(err)}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {CATEGORY_CONFIG.map((cfg) => {
          const Icon = cfg.icon;
          const selected = value === cfg.slug;
          return (
            <button
              key={cfg.slug}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(cfg.slug)}
              className={cn(
                'flex min-h-[44px] items-start gap-3 rounded-md border p-3 text-left transition',
                'focus:outline-none focus:ring-2 focus:ring-ring/40',
                selected
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/40',
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  selected ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {cfg.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {cfg.example}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {err && (
        <p role="alert" className="text-sm text-destructive">
          {err}
        </p>
      )}
    </fieldset>
  );
}
