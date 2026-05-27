'use client';

import type { FormState } from '@/lib/contribution/types';
import { cn } from '@/lib/utils';

function maskCpf(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 9);
  const p4 = digits.slice(9, 11);
  let out = p1;
  if (p2) out += '.' + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '-' + p4;
  return out;
}

export function StepIdentification({
  mode,
  name,
  email,
  cpf,
  onChange,
  errors,
}: {
  mode: 'identified' | 'anonymous' | null;
  name: string;
  email: string;
  cpf: string;
  onChange: (p: Partial<FormState>) => void;
  errors: Record<string, string>;
}) {
  return (
    <fieldset className="space-y-4">
      <legend>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          6. Identificação
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Contribuição anônima tem o mesmo peso. Identificar-se ajuda se a
          eu precise esclarecer um detalhe da sua contribuição.
        </p>
      </legend>

      <div role="radiogroup" aria-label="Modo de identificação" className="space-y-2">
        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition',
            mode === 'identified'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:bg-muted/40',
          )}
        >
          <input
            type="radio"
            name="identification_mode"
            value="identified"
            checked={mode === 'identified'}
            onChange={() => onChange({ identification_mode: 'identified' })}
            className="mt-1 h-4 w-4 cursor-pointer accent-primary"
          />
          <span>
            <span className="block text-sm font-semibold">Quero me identificar</span>
            <span className="block text-xs text-muted-foreground">
              Nome e e-mail são obrigatórios. CPF é opcional.
            </span>
          </span>
        </label>

        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition',
            mode === 'anonymous'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:bg-muted/40',
          )}
        >
          <input
            type="radio"
            name="identification_mode"
            value="anonymous"
            checked={mode === 'anonymous'}
            onChange={() => onChange({ identification_mode: 'anonymous' })}
            className="mt-1 h-4 w-4 cursor-pointer accent-primary"
          />
          <span>
            <span className="block text-sm font-semibold">Contribuir anonimamente</span>
            <span className="block text-xs text-muted-foreground">
              Sua contribuição entra no relatório sem dados pessoais.
            </span>
          </span>
        </label>
      </div>

      {errors.identification_mode && (
        <p role="alert" className="text-sm text-destructive">
          {errors.identification_mode}
        </p>
      )}

      {mode === 'identified' && (
        <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
          <div>
            <label htmlFor="identification_name" className="block text-sm font-medium">
              Nome completo
            </label>
            <input
              id="identification_name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => onChange({ identification_name: e.target.value })}
              aria-invalid={Boolean(errors.identification_name)}
              className="mt-2 block w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {errors.identification_name && (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {errors.identification_name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="identification_email" className="block text-sm font-medium">
              E-mail
            </label>
            <input
              id="identification_email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => onChange({ identification_email: e.target.value })}
              aria-invalid={Boolean(errors.identification_email)}
              className="mt-2 block w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {errors.identification_email && (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {errors.identification_email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="identification_cpf" className="block text-sm font-medium">
              CPF <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="identification_cpf"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => onChange({ identification_cpf: maskCpf(e.target.value) })}
              aria-describedby="identification_cpf_help"
              aria-invalid={Boolean(errors.identification_cpf)}
              maxLength={14}
              className="mt-2 block w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <p id="identification_cpf_help" className="mt-1 text-xs text-muted-foreground">
              Seu CPF nunca é armazenado em claro — apenas um hash criptográfico
              é guardado para evitar duplicatas.
            </p>
            {errors.identification_cpf && (
              <p role="alert" className="mt-1 text-sm text-destructive">
                {errors.identification_cpf}
              </p>
            )}
          </div>
        </div>
      )}
    </fieldset>
  );
}
