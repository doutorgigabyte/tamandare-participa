import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

type Props = {
  reason: 'infra_pending' | 'zero_contributions';
};

const COPY: Record<Props['reason'], { title: string; body: string }> = {
  infra_pending: {
    title: 'Dashboard em preparação',
    body:
      'A base de dados ainda está sendo configurada. Em breve, esta página mostra contagens, mapa de calor e contribuições recentes — tudo agregado e sem identidades.',
  },
  zero_contributions: {
    title: 'Seja a primeira pessoa a contribuir',
    body:
      'Nenhuma contribuição enviada ainda. Compartilha a tua visão sobre o Plano Diretor — drenagem, ocupação, turismo, patrimônio, qualquer pauta que importa pra ti.',
  },
};

export function EmptyState({ reason }: Props) {
  const { title, body } = COPY[reason];
  return (
    <div className="mt-10 rounded-2xl border border-border bg-card/60 p-10 text-center">
      <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{body}</p>
      <Link
        href="/contribuir"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Enviar minha contribuição
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
