'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import * as turf from '@turf/turf';
import { ArrowRight, Locate, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import type { Macroarea } from '@/lib/zoneamento/macroareas';

// Lazy-load do bundle pesado (Maps + deck.gl ≈ 300KB) — só baixa quando
// o usuário tem NEXT_PUBLIC_GMAPS_FRONTEND_KEY configurada e o mapa vai
// realmente renderizar. SSR=false porque deck.gl depende de WebGL.
const RealMap = dynamic(() => import('./real-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] min-h-[400px] items-center justify-center lg:h-[640px]">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Carregando mapa interativo…</p>
      </div>
    </div>
  ),
});

type Props = {
  macroareas: Macroarea[];
};

export function MapShell({ macroareas }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GMAPS_FRONTEND_KEY;
  const hasMap = Boolean(apiKey && !apiKey.includes('REPLACE-ME'));

  // Detecta em qual macroárea o usuário está via HTML5 geolocation + Turf.
  const handleWhereAmI = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não está disponível neste navegador.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = turf.point([pos.coords.longitude, pos.coords.latitude]);
        const found = macroareas.find((m) => {
          try {
            const poly = turf.polygon(m.geojson.coordinates);
            return turf.booleanPointInPolygon(point, poly);
          } catch {
            return false;
          }
        });
        if (found) {
          setSelected(found.slug);
        } else {
          setLocationError(
            'Você está fora dos polígonos atuais (que são aproximação visual). Escolha sua macroárea na lista pra continuar.',
          );
        }
        setLocating(false);
      },
      (err) => {
        const msg =
          err.code === 1
            ? 'Permissão de localização negada. Habilite no navegador.'
            : 'Falha ao obter localização.';
        setLocationError(msg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const selectedMacroarea = useMemo(
    () => macroareas.find((m) => m.slug === selected) ?? null,
    [selected, macroareas],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* MAP / PLACEHOLDER */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
        {hasMap ? (
          <RealMap
            apiKey={apiKey!}
            macroareas={macroareas}
            selected={selected}
            onSelect={setSelected}
          />
        ) : (
          <MapPlaceholder />
        )}
      </div>

      {/* SIDEBAR */}
      <aside className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleWhereAmI}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Locate className="h-4 w-4" />
          {locating ? 'Localizando…' : 'Em qual macroárea eu moro?'}
        </button>

        {locationError && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-900/40 bg-amber-950/30 p-3 text-xs text-amber-300">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            <p>{locationError}</p>
          </div>
        )}

        {selectedMacroarea ? (
          <Drawer macroarea={selectedMacroarea} onClose={() => setSelected(null)} />
        ) : (
          <MacroareaList macroareas={macroareas} onPick={setSelected} />
        )}
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MapPlaceholder (quando GMAPS key não está configurada)
// ---------------------------------------------------------------------------

function MapPlaceholder() {
  return (
    <div className="flex h-[60vh] min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center lg:h-[640px]">
      <MapPin className="h-12 w-12 text-zinc-700" />
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">
          Mapa interativo pronto pra ativar
        </h3>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Adicione <code className="font-mono text-primary">NEXT_PUBLIC_GMAPS_FRONTEND_KEY</code>{' '}
          em <code className="font-mono">.env.local</code> pra ver o mapa do
          Google com as 10 macroáreas sobrepostas. As coordenadas atuais são
          aproximação até a digitalização do mapa-síntese oficial.
        </p>
      </div>
      <p className="text-xs text-zinc-600">
        Enquanto isso, navegue pelos cards ao lado ou use &quot;Em qual macroárea eu
        moro?&quot;
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MacroareaList (lista lateral)
// ---------------------------------------------------------------------------

function MacroareaList({
  macroareas,
  onPick,
}: {
  macroareas: Macroarea[];
  onPick: (slug: string) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        10 macroáreas propostas
      </h3>
      <div className="flex flex-col gap-1">
        {macroareas.map((m) => (
          <button
            key={m.slug}
            type="button"
            onClick={() => onPick(m.slug)}
            className="group flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-900"
          >
            <span
              aria-hidden
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: m.display_color }}
            />
            <span className="flex-1 text-zinc-200 group-hover:text-zinc-50">
              {m.name.replace(/^(?:Macroárea|Zona Especial) (?:de |dos? |Centro )?/, '')}
            </span>
            <ArrowRight className="h-3 w-3 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drawer (info da macroárea selecionada)
// ---------------------------------------------------------------------------

function Drawer({
  macroarea,
  onClose,
}: {
  macroarea: Macroarea;
  onClose: () => void;
}) {
  return (
    <div
      className="rounded-xl border-2 p-5"
      style={{
        borderColor: `${macroarea.display_color}66`,
        backgroundColor: `${macroarea.display_color}10`,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Macroárea
          </p>
          <h3
            className="mt-1 text-lg font-semibold leading-tight"
            style={{ color: macroarea.display_color }}
          >
            {macroarea.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-200"
          aria-label="Voltar à lista"
        >
          Voltar à lista
        </button>
      </div>

      <p className="text-sm text-zinc-300">{macroarea.description_plain}</p>

      {macroarea.attention_points.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Pontos de atenção
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-200">
            {macroarea.attention_points.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden className="text-zinc-600">·</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <Link
          href={`/zoneamento/${macroarea.slug}`}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-800"
        >
          Ver detalhe completo
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href={{
            pathname: '/contribuir',
            query: { from_macroarea: macroarea.slug },
          }}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Contribuir sobre esta macroárea
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
