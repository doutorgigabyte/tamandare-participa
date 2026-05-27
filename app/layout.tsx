import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Tamandaré Participa',
    template: '%s · Tamandaré Participa',
  },
  description:
    'Plataforma cívica de participação qualificada na revisão do Plano Diretor de Tamandaré/PE.',
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  openGraph: {
    title: 'Tamandaré Participa',
    description:
      'O futuro da cidade deve ser planejado, decidido e validado com a sua gente.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
