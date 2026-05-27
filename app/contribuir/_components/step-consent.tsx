'use client';

import Link from 'next/link';

export function StepConsent({
  value,
  onChange,
  errors,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  errors: Record<string, string>;
}) {
  const err = errors.consent_lgpd;
  return (
    <fieldset className="space-y-4">
      <legend>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          7. Consentimento
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Antes de enviar, leia e marque a caixa abaixo. Sem esse consentimento
          não podemos registrar sua contribuição.
        </p>
      </legend>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/20 p-4 text-sm">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? 'consent_error' : undefined}
          className="mt-1 h-4 w-4 cursor-pointer accent-primary"
        />
        <span className="text-foreground">
          Concordo com o tratamento dos dados desta contribuição conforme a{' '}
          <Link
            href="/sobre#privacidade"
            className="text-atlantico-mar-profundo underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidade
          </Link>
          . Esta é uma plataforma cívica{' '}
          <strong className="font-medium">independente</strong>, sem vínculo com
          a Prefeitura ou qualquer órgão público. Minha contribuição ficará
          pública em <code className="font-mono">/contribuicoes</code> e poderá
          compor o documento independente que será protocolado, no nome do
          desenvolvedor, como contribuição cidadã.
        </span>
      </label>

      {err && (
        <p id="consent_error" role="alert" className="text-sm text-destructive">
          {err}
        </p>
      )}
    </fieldset>
  );
}
