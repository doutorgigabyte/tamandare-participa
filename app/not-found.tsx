import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <Compass className="mb-6 h-12 w-12 text-border" aria-hidden />
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Erro 404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Essa rota não existe nesta plataforma. Talvez você queria um destes
        caminhos abaixo.
      </p>

      <ul className="mt-8 grid w-full max-w-md gap-2 text-left text-sm">
        <LinkCard href="/" label="Início" sub="Landing com countdown e visão geral" />
        <LinkCard
          href="/diagnostico"
          label="Diagnóstico"
          sub="5 indicadores de Tamandaré comparados com o Brasil"
        />
        <LinkCard
          href="/zoneamento"
          label="Zoneamento"
          sub="As 10 macroáreas do novo Plano Diretor"
        />
        <LinkCard
          href="/contribuir"
          label="Contribuir"
          sub="Enviar contribuição em ~3 min"
        />
        <LinkCard
          href="/chat"
          label="Chat com a IA"
          sub="Tirar dúvidas com citações aos documentos"
        />
      </ul>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar pra início
      </Link>
    </main>
  );
}

function LinkCard({
  href,
  label,
  sub,
}: {
  href: string;
  label: string;
  sub: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-lg border border-border bg-muted/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card"
      >
        <span className="font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </Link>
    </li>
  );
}
