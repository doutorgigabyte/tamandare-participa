'use client';

import { CheckCircle2, Download } from 'lucide-react';
import type { ContributionSuccess } from '@/lib/contribution/types';

export function StepConfirmation({
  result,
  onStartOver,
}: {
  result: ContributionSuccess;
  onStartOver: () => void;
}) {
  const idShort = result.id.slice(0, 8);

  const handleDownload = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            id: result.id,
            hash_integrity: result.hash_full,
            hash_short: result.hash_short,
            status: result.status,
            received_at: result.created_at,
            platform: 'Tamandaré Participa',
            note:
              'Comprovante de contribuição. O hash de integridade permite verificar que o conteúdo não foi alterado após o recebimento.',
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tamandare-participa-contribuicao-${idShort}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle2
          aria-hidden="true"
          className="h-16 w-16 text-primary"
          strokeWidth={1.5}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {result.status === 'published'
            ? 'Contribuição publicada!'
            : 'Contribuição recebida!'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {result.status === 'published' ? (
            <>
              Validação automática passou — sua contribuição{' '}
              <strong className="font-medium text-foreground">já está em{' '}
              <span className="font-mono">/resultados</span></strong>{' '}
              compondo o agregado público.
            </>
          ) : (
            <>
              Sua contribuição foi recebida e está aguardando moderação. Você
              verá ela em{' '}
              <span className="font-medium text-foreground">/resultados</span>{' '}
              em até 2h.
            </>
          )}
        </p>
      </div>

      <dl className="mx-auto grid max-w-md grid-cols-1 gap-3 text-left text-sm sm:grid-cols-2">
        <div className="rounded-md border border-border bg-muted/20 p-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            ID
          </dt>
          <dd className="mt-1 font-mono text-sm text-foreground">{idShort}</dd>
        </div>
        <div className="rounded-md border border-border bg-muted/20 p-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Hash de integridade
          </dt>
          <dd className="mt-1 font-mono text-sm text-foreground">
            {result.hash_short}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-border bg-transparent px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Baixar comprovante (JSON)
        </button>

        <button
          type="button"
          onClick={onStartOver}
          className="min-h-[44px] rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Contribuir novamente
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Status atual:{' '}
        <span
          className={
            result.status === 'published'
              ? 'font-medium text-emerald-400'
              : 'font-medium text-amber-300'
          }
        >
          {result.status === 'published'
            ? 'Publicada (validação automática)'
            : 'Aguardando moderação'}
        </span>
      </p>
    </div>
  );
}
