import { MapShell } from './_components/map-shell';
import { MACROAREAS } from '@/lib/zoneamento/macroareas';

export const metadata = {
  title: 'Zoneamento — as 10 macroáreas propostas',
  description:
    'Mapa interativo com as 10 macroáreas do novo Plano Diretor de Tamandaré. Descubra em qual macroárea você mora e o que muda na sua região.',
};

export default function ZoneamentoPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-10">
      <header className="mb-6 max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-zinc-500">
          Zoneamento proposto
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          As 10 macroáreas de Tamandaré
        </h1>
        <p className="mt-3 text-base text-zinc-300">
          O novo Plano Diretor reorganiza a cidade em 10 macroáreas — cada uma
          com regras próprias de uso e ocupação. Clique no mapa ou na lista pra
          ver detalhes, ou use o botão pra descobrir em qual macroárea você
          mora.
        </p>
      </header>

      <MapShell macroareas={MACROAREAS} />

      <footer className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-xs text-zinc-500">
        <strong className="text-zinc-300">Sobre os polígonos:</strong>{' '}
        as coordenadas atuais são aproximação visual. Quando shapefiles
        precisos forem digitalizados a partir do mapa da pág. 4 da Circular
        001-2026, o mapa ganha precisão geográfica. As informações textuais
        oficiais já estão completas na página de detalhe de cada macroárea.
      </footer>
    </main>
  );
}
