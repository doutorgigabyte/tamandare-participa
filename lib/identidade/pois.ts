/**
 * Pontos de identidade turística de Tamandaré, com contagem de fotos
 * georreferenciadas (fonte: API do Flickr, levantamento ICR maio/2025
 * publicado no Caderno pág. 49).
 *
 * Usado em:
 * - /diagnostico/patrimonio-identidade (já consome via indicadores.ts)
 * - /zoneamento (overlay opcional de POIs no mapa)
 */

import data from '@/db/seed/identidade-pois.json';

export type IdentidadePOICategory =
  | 'praia'
  | 'patrimonio'
  | 'evento'
  | 'centro-urbano';

export type IdentidadePOI = {
  id: string;
  name: string;
  category: IdentidadePOICategory;
  lat: number;
  lng: number;
  photo_count: number;
  rank_brasil_context: string;
  note: string;
};

export const IDENTIDADE_POIS: IdentidadePOI[] = data.pois as IdentidadePOI[];

export const IDENTIDADE_SUMMARY = data.summary;

export function findPoi(id: string): IdentidadePOI | undefined {
  return IDENTIDADE_POIS.find((p) => p.id === id);
}

/** Bucket de cor por contagem — pra visualização */
export function colorForCount(count: number): string {
  if (count >= 200) return '#dc2626'; // hot
  if (count >= 100) return '#ea580c';
  if (count >= 50) return '#f59e0b';
  if (count >= 20) return '#84cc16';
  return '#22c55e'; // cold
}
