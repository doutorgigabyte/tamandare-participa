'use client';

import { Sparkles, User as UserIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CitationChip } from '@/components/citation-chip';
import type { ChatMessageDTO, Citation } from '@/lib/chat/types';

type Props = {
  message: ChatMessageDTO;
};

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      aria-label={isUser ? 'Sua pergunta' : 'Resposta do assistente'}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? 'bg-muted text-foreground/90'
            : 'bg-primary/15 text-primary'
        }`}
        aria-hidden
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-muted text-foreground'
              : 'bg-card/60 text-foreground ring-1 ring-zinc-800'
          }`}
        >
          {message.content}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <CitationsBlock citations={message.citations} />
        )}

        {!isUser && (
          <div className="mt-2">
            <Link
              href={{
                pathname: '/contribuir',
                query: { from_chat: message.id },
              }}
              className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-80"
            >
              Transformar isso em contribuição oficial
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CitationsBlock({ citations }: { citations: Citation[] }) {
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Fontes consultadas
      </span>
      <div className="flex flex-wrap gap-1.5">
        {citations.map((c) => (
          <span
            key={c.chunk_id}
            title={c.excerpt}
            className="cursor-help"
          >
            <CitationChip
              source={c.source}
              page={c.page_number ?? undefined}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
