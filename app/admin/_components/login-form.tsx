import { Lock } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'Senha incorreta.',
  missing: 'Informe a senha.',
};

export function LoginForm({ errorCode }: { errorCode?: string }) {
  const errorMsg = errorCode ? ERROR_MESSAGES[errorCode] : null;
  return (
    <main className="container mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-border bg-card/60 p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Acesso restrito
            </p>
            <h1 className="text-xl font-semibold text-foreground">
              Moderação Tamandaré Participa
            </h1>
          </div>
        </div>

        <form
          action="/api/admin/login"
          method="post"
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">ADMIN_TOKEN</span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              className="rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          {errorMsg && (
            <p className="text-sm text-atlantico-terracota" role="alert">
              {errorMsg}
            </p>
          )}
          <button
            type="submit"
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Sessão válida por 8h. Cookie HTTP-only com flag secure em produção.
        </p>
      </div>
    </main>
  );
}
