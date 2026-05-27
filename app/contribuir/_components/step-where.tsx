'use client';

import { AddressPicker } from '@/components/address-picker';
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
    <fieldset className="space-y-6">
      <legend>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          1. Onde fica?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite o endereço ou ponto de referência e escolha uma sugestão — ou
          marque o local diretamente no mapa.
        </p>
      </legend>

      <div>
        <label
          htmlFor="location_address"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Endereço ou ponto de referência
        </label>

        <AddressPicker
          id="location_address"
          value={value.location_address}
          onChange={(addr) =>
            onChange({
              location_address: addr,
              no_specific_location: false,
            })
          }
          disabled={value.no_specific_location}
          ariaInvalid={Boolean(err)}
          ariaDescribedBy={err ? 'location_address_error' : undefined}
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

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm transition hover:bg-muted/60">
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
          <span className="block font-medium text-foreground">
            Não tem local específico
          </span>
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
