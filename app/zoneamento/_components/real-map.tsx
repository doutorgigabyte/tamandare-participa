'use client';

import { useEffect, useMemo } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { GeoJsonLayer } from '@deck.gl/layers';
import type { Macroarea } from '@/lib/zoneamento/macroareas';

/**
 * Tudo que é heavy (Maps + deck.gl) vive aqui pra ser lazy-loaded
 * via `next/dynamic` no map-shell.tsx — usuários sem Maps key nunca
 * baixam estes ~300KB de JavaScript.
 */

const TAMANDARE_CENTER = { lat: -8.7553, lng: -35.1031 };
const MAP_ID = process.env.NEXT_PUBLIC_GMAPS_MAP_ID ?? 'tamandare-dark-v1';

type Props = {
  apiKey: string;
  macroareas: Macroarea[];
  selected: string | null;
  onSelect: (slug: string) => void;
};

export default function RealMap({ apiKey, macroareas, selected, onSelect }: Props) {
  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-[60vh] min-h-[400px] w-full lg:h-[640px]">
        <Map
          mapId={MAP_ID}
          defaultCenter={TAMANDARE_CENTER}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          colorScheme="DARK"
        >
          <DeckOverlay
            macroareas={macroareas}
            selected={selected}
            onSelect={onSelect}
          />
        </Map>
      </div>
    </APIProvider>
  );
}

function DeckOverlay({
  macroareas,
  selected,
  onSelect,
}: {
  macroareas: Macroarea[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const map = useMap();

  const layers = useMemo(() => {
    const featureCollection = {
      type: 'FeatureCollection' as const,
      features: macroareas.map((m) => ({
        type: 'Feature' as const,
        properties: { slug: m.slug, name: m.name, color: m.display_color },
        geometry: m.geojson,
      })),
    };
    return [
      new GeoJsonLayer({
        id: 'macroareas',
        data: featureCollection,
        filled: true,
        stroked: true,
        getFillColor: (f: unknown) => {
          const feature = f as { properties: { color: string; slug: string } };
          const c = hexToRgb(feature.properties.color);
          const alpha = selected === feature.properties.slug ? 220 : 140;
          return [c[0], c[1], c[2], alpha];
        },
        getLineColor: [255, 255, 255, 220],
        lineWidthMinPixels: 1,
        pickable: true,
        onClick: (info: unknown) => {
          const i = info as { object?: { properties?: { slug?: string } } };
          if (i.object?.properties?.slug) {
            onSelect(i.object.properties.slug);
          }
        },
        updateTriggers: { getFillColor: selected },
      }),
    ];
  }, [macroareas, selected, onSelect]);

  useEffect(() => {
    if (!map) return;
    const overlay = new GoogleMapsOverlay({ layers });
    overlay.setMap(map as unknown as google.maps.Map);
    return () => overlay.setMap(null);
  }, [map, layers]);

  return null;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}
