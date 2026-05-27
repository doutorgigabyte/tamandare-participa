'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';
import { SuggestedQuestions } from './suggested-questions';
import type { ChatMessageDTO, ChatPostResponse, ChatPostError } from '@/lib/chat/types';

const SESSION_KEY = 'tp_chat_session_id';

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Recupera session_id se já existe
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) setSessionId(saved);
    } catch {
      /* sessionStorage indisponível */
    }
  }, []);

  // Auto-scroll pra última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pending]);

  async function sendMessage(text: string) {
    const userMsg: ChatMessageDTO = {
      id: Date.now() * -1, // negativo = otimista (não veio do DB ainda)
      session_id: sessionId ?? 'pending',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setPending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });

      if (!res.ok) {
        const err = (await res.json()) as ChatPostError;
        if (err.error === 'infra_pending') {
          toast.error(err.detail, { duration: 8000 });
        } else if (err.error === 'validation_failed') {
          toast.error(err.detail);
        } else {
          toast.error(err.detail ?? 'Falha desconhecida.');
        }
        // Remove a mensagem otimista do usuário em erro de validação
        if (err.error === 'validation_failed') {
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        }
        return;
      }

      const data = (await res.json()) as ChatPostResponse;
      if (data.session_id !== sessionId) {
        setSessionId(data.session_id);
        try {
          sessionStorage.setItem(SESSION_KEY, data.session_id);
        } catch {
          /* noop */
        }
      }
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      toast.error('Falha de rede. Tente novamente.');
      // eslint-disable-next-line no-console
      console.error('[chat] fetch falhou:', err);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit() {
    const text = input.trim();
    if (text.length < 3) return;
    void sendMessage(text);
  }

  function handleSuggestion(text: string) {
    setInput(text);
    void sendMessage(text);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col gap-4">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
        aria-live="polite"
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">
                Pergunte sobre o Plano Diretor
              </h2>
              <p className="mt-1 max-w-md text-sm text-zinc-400">
                As respostas vêm dos 2 documentos oficiais (Circular 001-2026 e
                Caderno ICR). Cada afirmação técnica é citada.
              </p>
            </div>
            <SuggestedQuestions onPick={handleSuggestion} disabled={pending} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {pending && (
              <div className="text-sm text-zinc-500" aria-label="Buscando contexto e gerando resposta">
                Buscando nos documentos oficiais…
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        pending={pending}
      />
    </div>
  );
}
