'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Send } from 'lucide-react';

/**
 * Header global com navegação principal. Funciona desktop (links horizontais)
 * e mobile (hamburger → drawer full-screen).
 *
 * Itens são organizados em 2 grupos:
 *   - Primários (sempre visíveis): Início, Diagnóstico, Zoneamento, Legislação, Chat
 *   - CTA destacado: Contribuir
 *   - Mobile drawer adiciona: Contribuições, Resultados, Audiência, Sobre
 */

type NavLink = {
  href: string;
  label: string;
  showOnDesktop?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: '/diagnostico', label: 'Diagnóstico', showOnDesktop: true },
  { href: '/zoneamento', label: 'Zoneamento', showOnDesktop: true },
  { href: '/legislacao', label: 'Legislação', showOnDesktop: true },
  { href: '/chat', label: 'Chat IA', showOnDesktop: true },
  { href: '/contribuicoes', label: 'Contribuições' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/audiencia', label: 'Audiência' },
  { href: '/sobre', label: 'Sobre' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Fecha drawer ao navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body scroll lock quando drawer aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg"
          aria-label="Tamandaré Participa — início"
        >
          Tamandaré <span className="text-atlantico-mar-profundo">Participa</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          {NAV_LINKS.filter((l) => l.showOnDesktop).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                isActive(link.href)
                  ? 'bg-atlantico-mar-raso/15 font-medium text-atlantico-mar-profundo'
                  : 'text-foreground/85 hover:bg-muted hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Spacer + CTA desktop */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/contribuir"
            className="hidden items-center gap-1.5 rounded-full bg-atlantico-mar-raso px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-atlantico-mar-profundo sm:inline-flex"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            Contribuir
          </Link>

          {/* Hamburger mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted lg:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-14 z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <nav className="container mx-auto px-4 py-4">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-4 py-3 text-base transition-colors ${
                      isActive(link.href)
                        ? 'bg-atlantico-mar-raso/15 font-medium text-atlantico-mar-profundo'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <Link
                  href="/contribuir"
                  className="flex items-center justify-center gap-2 rounded-lg bg-atlantico-mar-raso px-4 py-3 text-base font-medium text-white shadow-soft"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Contribuir
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
