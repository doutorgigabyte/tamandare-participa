'use client';

import { MACROAREA_OPTIONS } from '@/lib/contribution/macroareas';
import type { FormState } from '@/lib/contribution/types';

export function StepMacroarea({
  value,
  unknown,
  onChange,
  errors,
}: {
  value: string | null;
  unknown: boolean;
  onChange: (p: Partial<FormState>) => void;
  errors: Record<string, string>;
}) {
  const err = errors.macroarea_slug;
  const selected = unknown ? '__unknown__' : value ?? '';

  return (
    <fieldset className="space-y-4">
      <legend>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          3. Qual macroárea?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          As macroáreas dividem o território de Tamandaré para o novo zoneamento.
          Se não sabe qual escolher, tudo bem — selecione &ldquo;Não sei&rdquo;.
        </p>
      </legend>

      <div>
        <label htmlFor="macroarea_slug" className="block text-sm font-medium">
          Macroárea
        </label>
        <select
          id="macroarea_slug"
          value={selected}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '__unknown__') {
              onChange({ macroarea_unknown: true, macroarea_slug: null });
            } else if (v === '') {
              onChange({ macroarea_unknown: false, macroarea_slug: null });
            } else {
              onChange({ macroarea_unknown: false, macroarea_slug: v });
            }
          }}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? 'macroarea_slug_error' : undefined}
          className="mt-2 block w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="">— Selecione —</option>
          <option value="__unknown__">Não sei / Não tenho certeza</option>
          {MACROAREA_OPTIONS.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Visual: bolinha com a cor da macroárea selecionada */}
        {selected && selected !== '__unknown__' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-full border border-border"
              style={{
                backgroundColor:
                  MACROAREA_OPTIONS.find((m) => m.slug === selected)
                    ?.display_color ?? 'transparent',
              }}
            />
            Cor de referência no mapa.
          </div>
        )}

        {err && (
          <p
            id="macroarea_slug_error"
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
