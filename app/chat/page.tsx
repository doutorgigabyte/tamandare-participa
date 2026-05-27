import { ChatShell } from './_components/chat-shell';

export const metadata = {
  title: 'Chat IA — Tirar dúvidas',
  description:
    'Assistente RAG sobre a Circular 001-2026 e o caderno do Instituto Cidades Responsivas. Citação obrigatória de fonte.',
};

export default function ChatPage() {
  return (
    <main className="container mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Chat com a IA</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tire dúvidas sobre a revisão do Plano Diretor. Cada resposta cita as
          páginas exatas dos documentos oficiais.
        </p>
      </header>

      <ChatShell />
    </main>
  );
}
