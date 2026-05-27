/**
 * Camadas de contexto geográfico via OpenStreetMap (Overpass API).
 *
 * Coletadas em 27/05/2026, gravadas em db/seed/osm/*.geojson.
 * Re-coletar: rodar o script Python apropriado (sem auth, livre).
 *
 * Uso:
 *   - /zoneamento map: overlay opcional (toggle de camadas)
 *   - /diagnostico/vegetacao: contextualizar manguezais
 *   - /diagnostico/patrimonio: marcar Forte + Igrejas
 */

import hidrografiaData from '@/db/seed/osm/hidrografia.json';
import manguezaisData from '@/db/seed/osm/manguezais.json';
import patrimonioData from '@/db/seed/osm/patrimonio.json';
import costaData from '@/db/seed/osm/costa.json';
import viasData from '@/db/seed/osm/vias_principais.json';

export type OSMLayerKey =
  | 'hidrografia'
  | 'manguezais'
  | 'patrimonio'
  | 'costa'
  | 'vias_principais';

export type OSMFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      osm_id?: number;
      osm_type?: string;
      layer: string;
      name?: string | null;
      tags?: Record<string, string>;
    };
    geometry:
      | { type: 'Point'; coordinates: [number, number] }
      | { type: 'LineString'; coordinates: [number, number][] }
      | { type: 'MultiLineString'; coordinates: [number, number][][] }
      | { type: 'Polygon'; coordinates: [number, number][][] };
  }>;
};

// Cast via `unknown` porque os GeoJSON do OSM têm tags com chaves variadas
// que TS infere como tipos literais — o tipo OSMFeatureCollection generaliza
// pra Record<string, string>, então um cast direto não compila.
export const OSM_LAYERS: Record<OSMLayerKey, OSMFeatureCollection> = {
  hidrografia: hidrografiaData as unknown as OSMFeatureCollection,
  manguezais: manguezaisData as unknown as OSMFeatureCollection,
  patrimonio: patrimonioData as unknown as OSMFeatureCollection,
  costa: costaData as unknown as OSMFeatureCollection,
  vias_principais: viasData as unknown as OSMFeatureCollection,
};

/** Metadata de exibição pra UI de toggle de camadas */
export const OSM_LAYER_META: Record<
  OSMLayerKey,
  { label: string; color: string; description: string }
> = {
  hidrografia: {
    label: 'Hidrografia',
    color: '#3b82f6',
    description: 'Rios Ariquindá, Mamucabas e córregos',
  },
  manguezais: {
    label: 'Manguezais e áreas úmidas',
    color: '#15803d',
    description: 'Esponja natural contra enchentes — preservação prioritária',
  },
  patrimonio: {
    label: 'Patrimônio histórico',
    color: '#dc2626',
    description: 'Forte de Santo Inácio, Igrejas, sítios históricos',
  },
  costa: {
    label: 'Linha de costa',
    color: '#0ea5e9',
    description: 'Costa atlântica + praias mapeadas',
  },
  vias_principais: {
    label: 'Vias principais',
    color: '#a3a3a3',
    description: 'Rodovias e vias estruturantes',
  },
};

/**
 * Filtra apenas features com `name` definido (mais úteis pra apresentação).
 */
export function namedFeaturesOf(layer: OSMLayerKey) {
  return OSM_LAYERS[layer].features.filter(
    (f) => f.properties.name && f.properties.name.trim().length > 0,
  );
}

/**
 * Lista landmarks de patrimônio com coords precisas (Point features).
 */
export function patrimonioPoints() {
  return OSM_LAYERS.patrimonio.features.filter(
    (f) => f.geometry.type === 'Point' && f.properties.name,
  );
}

/**
 * Total de features por camada (pra UI mostrar "5 hidrovias mapeadas" etc.).
 */
export const OSM_LAYER_COUNTS = Object.fromEntries(
  (Object.keys(OSM_LAYERS) as OSMLayerKey[]).map((k) => [
    k,
    OSM_LAYERS[k].features.length,
  ]),
) as Record<OSMLayerKey, number>;
