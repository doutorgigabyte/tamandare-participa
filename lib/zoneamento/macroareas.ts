/**
 * Loader tipado das 10 macroáreas do novo zoneamento.
 *
 * Fonte: db/seed/macroareas.example.json (placeholder GeoJSON até ICR liberar
 * shapefiles reais — ver adendo v1.2 §5.2).
 *
 * Quando shapefiles reais chegarem, o JSON ganha as coordenadas corretas e
 * tudo que depende daqui (Maps overlay + point-in-polygon "estou aqui")
 * passa a funcionar com precisão.
 */

import seed from '@/db/seed/macroareas.example.json';

export type MacroareaPolygon =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

export type Macroarea = {
  slug: string;
  name: string;
  display_color: string;
  description_plain: string;
  description_official: string;
  geojson: MacroareaPolygon;
  changes_from_current: string;
  attention_points: string[];
};

export const MACROAREAS: Macroarea[] = seed.macroareas as Macroarea[];

export const MACROAREA_SLUGS = MACROAREAS.map((m) => m.slug);

export function findMacroarea(slug: string): Macroarea | undefined {
  return MACROAREAS.find((m) => m.slug === slug);
}

/**
 * Versão pública das macroáreas pra client components — exclui o `geojson`
 * pesado de seções que só precisam do nome+cor (cards, drawer).
 */
export type MacroareaSummary = Omit<Macroarea, 'geojson'>;

export const MACROAREA_SUMMARIES: MacroareaSummary[] = MACROAREAS.map(
  ({ geojson, ...rest }) => rest,
);
