/**
 * Configurações compartilhadas do Google Maps.
 * Adendo v1.1 §1.1 + §7.1.
 */

/** Centro de Tamandaré/PE. */
export const TAMANDARE_CENTER = {
  lat: -8.7553,
  lng: -35.1031,
} as const;

/** Bounding box aproximado pra biasing do Places Autocomplete. */
export const TAMANDARE_BOUNDS = {
  north: -8.72,
  south: -8.82,
  east: -35.05,
  west: -35.17,
} as const;

/** Zoom default no `/zoneamento`. */
export const TAMANDARE_DEFAULT_ZOOM = 13;

/**
 * Map ID customizado criado no Cloud Console.
 * Estilo dark monochrome — adendo v1.1 §5.3.
 */
export const TAMANDARE_MAP_ID =
  process.env.NEXT_PUBLIC_GMAPS_MAP_ID ?? 'tamandare-dark-v1';
