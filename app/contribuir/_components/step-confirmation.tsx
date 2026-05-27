'use client';

import { CheckCircle2, Download, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { ContributionSuccess } from '@/lib/contribution/types';

export function StepConfirmation({
  result,
  onStartOver,
}: {
  result: ContributionSuccess;
  onStartOver: () => void;
}) {
  const idShort = result.id.slice(0, 8);
  const receiptUrl = `/api/contribute/${result.id}/receipt`;

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-atlantico-mata-clara/40">
          <CheckCircle2
            aria-hidden="true"
            className="h-12 w-12 text-atlantico-mata-atlantica"
            strokeWidth={1.5}
          />
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {result.status === 'published'
            ? 'Contribuição publicada!'
            : 'Contribuição recebida!'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {result.status === 'published' ? (
            <>
              Validação automática passou — sua contribuição{' '}
              <strong className="font-medium text-foreground">
                já está pública em{' '}
                <Link
                  href="/resultados"
                  className="font-mono underline-offset-2 hover:underline"
                >
                  /resultados
                </Link>
              </strong>{' '}
              compondo o agregado público.
            </>
          ) : (
            <>
              Sua contribuição foi recebida e está aguardando moderação. Você
              verá ela em{' '}
              <Link
                href="/resultados"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                /resultados
              </Link>{' '}
              em até 2h.
            </>
          )}
        </p>
      </div>

      <dl className="mx-auto grid max-w-md grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            ID
          </dt>
          <dd className="mt-1 font-mono text-sm font-semibold text-foreground">
            {idShort.toUpperCase()}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Hash de integridade
          </dt>
          <dd className="mt-1 font-mono text-sm text-foreground">
            {result.hash_short}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={receiptUrl}
          download={`comprovante-tamandare-${idShort}.pdf`}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-atlantico-mar-raso px-6 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-atlantico-mar-profundo"
        >
          <FileText aria-hidden="true" className="h-4 w-4" />
          Baixar comprovante (PDF)
        </a>

        <a
          href={receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-all hover:border-atlantico-mar-raso/40 hover:bg-muted/50"
        >
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
          Abrir no navegador
        </a>
      </div>

      <button
        type="button"
        onClick={onStartOver}
        className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-atlantico-mar-profundo underline-offset-2 hover:underline"
      >
        Contribuir novamente
      </button>

      <p className="mx-auto max-w-md text-xs text-muted-foreground">
        Status atual:{' '}
        <span
          className={
            result.status === 'published'
              ? 'font-medium text-atlantico-mata-atlantica'
              : 'font-medium text-atlantico-terracota'
          }
        >
          {result.status === 'published'
            ? 'Publicada (validação automática)'
            : 'Aguardando moderação'}
        </span>
        . Você pode acompanhar o agregado público a qualquer momento em{' '}
        <Link
          href="/resultados"
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          /resultados
        </Link>
        .
      </p>
    </div>
  );
}
