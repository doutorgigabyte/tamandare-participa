'use client';

import { useCallback, useRef } from 'react';
import { Paperclip, X } from 'lucide-react';
import type { AttachmentMeta } from '@/lib/contribution/types';

const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/*,.pdf';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StepAttachments({
  value,
  onChange,
  errors,
}: {
  value: AttachmentMeta[];
  onChange: (next: AttachmentMeta[]) => void;
  errors: Record<string, string>;
}) {
  const err = errors.attachments;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (filesList: FileList | null) => {
      if (!filesList) return;
      const incoming = Array.from(filesList);
      const next: AttachmentMeta[] = [...value];
      for (const f of incoming) {
        if (next.length >= MAX_FILES) break;
        if (f.size > MAX_BYTES) continue; // ignora silenciosamente — validateStep flagra
        next.push({ name: f.name, size: f.size, type: f.type || 'application/octet-stream' });
      }
      onChange(next.slice(0, MAX_FILES));
      // limpa o input pra permitir re-selecionar o mesmo arquivo após remoção
      if (inputRef.current) inputRef.current.value = '';
    },
    [value, onChange],
  );

  const removeAt = useCallback(
    (idx: number) => {
      onChange(value.filter((_, i) => i !== idx));
    },
    [value, onChange],
  );

  return (
    <fieldset className="space-y-4">
      <legend>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          5. Anexos <span className="text-base font-normal text-muted-foreground">(opcional)</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Fotos da situação ou documentos. Máx. {MAX_FILES} arquivos, {' '}
          {formatSize(MAX_BYTES)} cada.
        </p>
      </legend>

      <div>
        <label
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition hover:bg-muted/40"
          htmlFor="attachments"
        >
          <Paperclip aria-hidden="true" className="h-4 w-4" />
          {value.length === 0
            ? 'Toque para adicionar fotos ou PDFs'
            : `Adicionar mais (${value.length}/${MAX_FILES})`}
        </label>
        <input
          ref={inputRef}
          id="attachments"
          type="file"
          accept={ACCEPT}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
          aria-describedby={err ? 'attachments_error' : undefined}
          disabled={value.length >= MAX_FILES}
        />

        {value.length > 0 && (
          <ul className="mt-4 space-y-2">
            {value.map((a, i) => (
              <li
                key={`${a.name}-${i}`}
                className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
              >
                <Paperclip aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">
                  <span className="block truncate text-foreground">{a.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatSize(a.size)} · {a.type || 'arquivo'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remover ${a.name}`}
                  className="rounded p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Nota: no MVP atual os arquivos são registrados apenas como referência
          (nome e tamanho). O upload completo será habilitado em breve.
        </p>

        {err && (
          <p
            id="attachments_error"
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
