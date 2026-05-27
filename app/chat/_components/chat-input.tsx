'use client';

import { useRef, type FormEvent, type KeyboardEvent } from 'react';
import { SendHorizonal, Loader2 } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  pending?: boolean;
};

export function ChatInput({ value, onChange, onSubmit, disabled, pending }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled || pending) return;
    if (value.trim().length < 3) return;
    onSubmit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envia, Shift+Enter quebra linha (padrão Claude/ChatGPT)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !pending && value.trim().length >= 3) {
        onSubmit();
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Pergunte sobre o Plano Diretor de Tamandaré..."
        disabled={disabled}
        maxLength={2000}
        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 pr-14 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        aria-label="Pergunta para o assistente"
      />
      <button
        type="submit"
        disabled={disabled || pending || value.trim().length < 3}
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={pending ? 'Aguardando resposta' : 'Enviar pergunta'}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonal className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
