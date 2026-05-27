'use client';

import type { SuggestedQuestion } from '@/lib/chat/types';

/**
 * Sugestões iniciais (PRD v1.0 §5.4).
 * Aparecem quando o chat está vazio. Click envia a pergunta direto.
 */
const QUESTIONS: SuggestedQuestion[] = [
  {
    id: 'sobrado-centro',
    text: 'Posso construir um sobrado no centro?',
    topic: 'parametros-urbanisticos',
  },
  {
    id: 'gabarito-carneiros',
    text: 'Por que reduziram o gabarito em Carneiros?',
    topic: 'zoneamento',
  },
  {
    id: 'macroarea-morros',
    text: 'Onde fica a Macroárea Social Morros?',
    topic: 'zoneamento',
  },
  {
    id: 'protecao-ambiental',
    text: 'Quais são as áreas de proteção ambiental?',
    topic: 'meio-ambiente',
  },
];

type Props = {
  onPick: (question: string) => void;
  disabled?: boolean;
};

export function SuggestedQuestions({ onPick, disabled }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {QUESTIONS.map((q) => (
        <button
          key={q.id}
          type="button"
          onClick={() => onPick(q.text)}
          disabled={disabled}
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-left text-sm text-zinc-200 transition-colors hover:border-primary/60 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Perguntar: ${q.text}`}
        >
          <span className="block text-xs uppercase tracking-wide text-zinc-500">
            Exemplo
          </span>
          <span className="mt-1 block">{q.text}</span>
        </button>
      ))}
    </div>
  );
}
