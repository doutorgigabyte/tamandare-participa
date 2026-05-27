'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Flag, Trash2, Undo2 } from 'lucide-react';

type Contribution = {
  id: string;
  category: string;
  macroarea_slug: string | null;
  body: string;
  status: string;
  is_anonymous: boolean;
  moderator_notes: string | null;
  hash_integrity: string;
  location_address: string | null;
  created_at: string;
  published_at: string | null;
};

type Action = 'approve' | 'spam' | 'flag' | 'unpublish';

export function ModerationQueue({
  contributions,
}: {
  contributions: Contribution[];
}) {
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const visible = contributions.filter((c) => !removed.has(c.id));

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-10 text-center text-sm text-zinc-500">
        Nenhuma contribuição nesta fila.
      </div>
    );
  }

  async function moderate(id: string, action: Action) {
    setPending((p) => new Set(p).add(id));
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? 'Falha ao moderar.');
        return;
      }
      const labels: Record<Action, string> = {
        approve: 'publicada',
        spam: 'marcada como spam',
        flag: 'sinalizada',
        unpublish: 'devolvida pra fila',
      };
      toast.success(`Contribuição ${labels[action]}.`);
      setRemoved((r) => new Set(r).add(id));
    } catch (err) {
      toast.error('Erro de rede.');
      // eslint-disable-next-line no-console
      console.error('[admin] moderate fetch failed:', err);
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((c) => (
        <Card
          key={c.id}
          c={c}
          onAction={(a) => moderate(c.id, a)}
          pending={pending.has(c.id)}
        />
      ))}
    </div>
  );
}

function Card({
  c,
  onAction,
  pending,
}: {
  c: Contribution;
  onAction: (a: Action) => void;
  pending: boolean;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5">
      <header className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <StatusBadge status={c.status} />
        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300">
          {c.category}
        </span>
        {c.macroarea_slug && (
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300">
            {c.macroarea_slug}
          </span>
        )}
        {c.is_anonymous && (
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-400">
            anônimo
          </span>
        )}
        <span className="ml-auto font-mono text-zinc-500">
          {new Date(c.created_at).toLocaleString('pt-BR')}
        </span>
      </header>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
        {c.body}
      </p>

      {c.location_address && (
        <p className="mt-3 text-xs text-zinc-500">
          Endereço: <span className="text-zinc-300">{c.location_address}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>
          Hash: <span className="font-mono text-zinc-400">{c.hash_integrity.slice(0, 16)}…</span>
        </span>
        {c.moderator_notes && (
          <span>
            Notas: <span className="text-zinc-400">{c.moderator_notes}</span>
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {c.status !== 'published' && (
          <ActionButton onClick={() => onAction('approve')} pending={pending} variant="success" icon={CheckCircle}>
            Aprovar
          </ActionButton>
        )}
        {c.status === 'published' && (
          <ActionButton onClick={() => onAction('unpublish')} pending={pending} variant="neutral" icon={Undo2}>
            Devolver pra fila
          </ActionButton>
        )}
        {c.status !== 'flagged' && (
          <ActionButton onClick={() => onAction('flag')} pending={pending} variant="warning" icon={Flag}>
            Sinalizar
          </ActionButton>
        )}
        {c.status !== 'spam' && (
          <ActionButton onClick={() => onAction('spam')} pending={pending} variant="danger" icon={Trash2}>
            Spam
          </ActionButton>
        )}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pendente', cls: 'border-amber-900/60 bg-amber-950/40 text-amber-300' },
    published: { label: 'Publicada', cls: 'border-emerald-900/60 bg-emerald-950/40 text-emerald-300' },
    flagged: { label: 'Sinalizada', cls: 'border-orange-900/60 bg-orange-950/40 text-orange-300' },
    spam: { label: 'Spam', cls: 'border-red-900/60 bg-red-950/40 text-red-300' },
  };
  const cfg = map[status] ?? { label: status, cls: 'border-zinc-800 bg-zinc-900 text-zinc-300' };
  return (
    <span className={`rounded-full border px-2 py-0.5 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

const VARIANT_CLS: Record<string, string> = {
  success: 'border-emerald-900/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/60',
  warning: 'border-orange-900/40 bg-orange-950/30 text-orange-300 hover:bg-orange-950/60',
  danger: 'border-red-900/40 bg-red-950/30 text-red-300 hover:bg-red-950/60',
  neutral: 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800',
};

function ActionButton({
  onClick,
  pending,
  variant,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  pending: boolean;
  variant: keyof typeof VARIANT_CLS;
  icon: typeof CheckCircle;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${VARIANT_CLS[variant]}`}
    >
      <Icon className="h-3 w-3" />
      {children}
    </button>
  );
}
