'use client';

import { Mic2, AudioLines, X } from 'lucide-react';
import { AudioRecorder } from '@/components/audio-recorder';
import type { FormState } from '@/lib/contribution/types';

const MIN_CHARS = 50;
const MAX_CHARS = 5000;

const PLACEHOLDER =
  'Ex: A Rua tal não tem boca-de-lobo e alaga sempre que chove forte. O novo Plano deveria prever drenagem antes do asfalto.';

export function StepBody({
  value,
  audioUrl,
  onChange,
  errors,
}: {
  value: string;
  audioUrl: string | null;
  onChange: (patch: Partial<FormState>) => void;
  errors: Record<string, string>;
}) {
  const err = errors.body;
  const trimmedLen = value.trim().length;
  const remaining = MIN_CHARS - trimmedLen;
  const isShort = trimmedLen < MIN_CHARS;

  return (
    <fieldset className="space-y-6">
      <legend>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          4. Sua contribuição
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Escreva ou grave em áudio — como for mais fácil pra você. Quanto mais
          específico (rua, situação, sugestão), mais útil pro relatório.
        </p>
      </legend>

      <AudioRecorder
        onTranscribed={(text, audio_url) => {
          // Substitui o texto atual pelo transcrito (idempotente: pessoa pode
          // gravar de novo). audio_url é persistido pra ir junto no submit.
          onChange({ body: text.slice(0, MAX_CHARS), audio_url });
        }}
      />

      <div>
        <div className="flex items-end justify-between">
          <label
            htmlFor="body"
            className="block text-sm font-medium text-foreground"
          >
            Texto da contribuição
          </label>
          <span
            className={
              isShort
                ? 'text-xs text-muted-foreground'
                : 'text-xs text-atlantico-mar-profundo'
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
          onChange={(e) => onChange({ body: e.target.value.slice(0, MAX_CHARS) })}
          placeholder={PLACEHOLDER}
          rows={8}
          maxLength={MAX_CHARS}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? 'body_error' : 'body_help'}
          className="mt-2 block w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground shadow-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <p id="body_help" className="mt-2 text-xs text-muted-foreground">
          Mínimo {MIN_CHARS} caracteres. Limite {MAX_CHARS.toLocaleString('pt-BR')}.
          {remaining > 0 && ` Faltam ${remaining}.`}
        </p>

        {audioUrl && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-atlantico-mata-clara/60 bg-atlantico-mata-clara/15 px-3 py-2.5 text-sm">
            <AudioLines
              className="h-4 w-4 flex-shrink-0 text-atlantico-mata-atlantica"
              aria-hidden
            />
            <span className="flex-1 text-foreground">
              Áudio anexado à contribuição (será disponibilizado publicamente).
            </span>
            <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            <button
              type="button"
              onClick={() => onChange({ audio_url: null })}
              className="inline-flex items-center gap-1 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remover áudio"
              title="Remover áudio (mantém o texto)"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}

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
