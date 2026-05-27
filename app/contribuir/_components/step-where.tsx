'use client';

import type { FormState } from '@/lib/contribution/types';

type Value = Pick<FormState, 'location_address' | 'no_specific_location'>;

export function StepWhere({
  value,
  onChange,
  errors,
}: {
  value: Value;
  onChange: (p: Partial<FormState>) => void;
  errors: Record<string, string>;
}) {
  const err = errors.location_address;
  return (
    <fieldset className="space-y-4">
      <legend>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          1. Onde fica?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Endereço, ponto de referência ou CEP. O sistema localiza automaticamente.
        </p>
      </legend>

      <div>
        <label
          htmlFor="location_address"
          className="block text-sm font-medium"
        >
          Endereço ou ponto de referência
        </label>
        <input
          id="location_address"
          type="text"
          inputMode="text"
          autoComplete="street-address"
          value={value.location_address}
          onChange={(e) =>
            onChange({ location_address: e.target.value, no_specific_location: false })
          }
          placeholder="Ex: Rua Praia dos Carneiros, 100"
          disabled={value.no_specific_location}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? 'location_address_error' : undefined}
          className="mt-2 block w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {err && (
          <p
            id="location_address_error"
            role="alert"
            className="mt-2 text-sm text-destructive"
          >
            {err}
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm transition hover:bg-muted/40">
        <input
          type="checkbox"
          checked={value.no_specific_location}
          onChange={(e) =>
            onChange({
              no_specific_location: e.target.checked,
              location_address: e.target.checked ? '' : value.location_address,
            })
          }
          className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
          aria-describedby="no_specific_location_help"
        />
        <span>
          <span className="block font-medium">Não tem local específico</span>
          <span
            id="no_specific_location_help"
            className="text-muted-foreground"
          >
            Minha contribuição é sobre Tamandaré como um todo.
          </span>
        </span>
      </label>
    </fieldset>
  );
}
