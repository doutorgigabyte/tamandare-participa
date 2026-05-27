'use client';

import { Mic } from 'lucide-react';

const MIN_CHARS = 50;
const MAX_CHARS = 5000;

const PLACEHOLDER =
  'Ex: A Rua tal não tem boca-de-lobo e alaga sempre que chove forte. O novo Plano deveria prever drenagem antes do asfalto.';

export function StepBody({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (v: string) => void;
  errors: Record<string, string>;
}) {
  const err = errors.body;
  const trimmedLen = value.trim().length;
  const remaining = MIN_CHARS - trimmedLen;
  const isShort = trimmedLen < MIN_CHARS;

  return (
    <fieldset className="space-y-4">
      <legend>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          4. Sua contribuição
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Escreva com suas palavras. Quanto mais específico (rua, situação, sugestão),
          mais útil para o relatório que vai à Prefeitura.
        </p>
      </legend>

      <div>
        <div className="flex items-end justify-between">
          <label htmlFor="body" className="block text-sm font-medium">
            Texto da contribuição
          </label>
          <span
            className={
              isShort
                ? 'text-xs text-muted-foreground'
                : 'text-xs text-primary'
            }
            aria-live="polite"
          >
            {isShort
              ? `${trimmedLen}/${MIN_CHARS} mínimo`
              : `${trimmedLen} caracteres`}
          </span>
        </div>

        <textarea
          id="body"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          placeholder={PLACEHOLDER}
          rows={8}
          maxLength={MAX_CHARS}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? 'body_error' : 'body_help'}
          className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <p id="body_help" className="mt-2 text-xs text-muted-foreground">
          Mínimo {MIN_CHARS} caracteres. Limite {MAX_CHARS.toLocaleString('pt-BR')}.
          {remaining > 0 && ` Faltam ${remaining}.`}
        </p>

        <div className="mt-3">
          <button
            type="button"
            disabled
            title="Em breve — gravação de voz chega no MVP 2"
            aria-disabled="true"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground opacity-60"
          >
            <Mic aria-hidden="true" className="h-4 w-4" />
            Gravar áudio
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              em breve
            </span>
          </button>
        </div>

        {err && (
          <p
            id="body_error"
            role="alert"
            className="mt-2 text-sm text-destructive"
          >
            {err}
          </p>
        )}
      </div>
    </fieldset>
  );
}
