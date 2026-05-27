import macroareasJson from '@/db/seed/macroareas.example.json';

/**
 * Loader/helpers para as 10 macroáreas do Plano Diretor revisado.
 *
 * Lê o seed JSON local (db/seed/macroareas.example.json). Quando o Supabase
 * estiver provisionado e a tabela `macroareas` populada, trocar pra fetch via
 * Supabase. A shape é a mesma — só muda a fonte.
 */

export type MacroareaOption = {
  slug: string;
  name: string;
  display_color: string;
};

type RawMacroarea = {
  slug: string;
  name: string;
  display_color: string;
  description_plain: string;
  description_official: string;
  geojson: unknown;
  changes_from_current: string;
  attention_points: string[];
};

type RawSeed = {
  macroareas: RawMacroarea[];
};

/**
 * Lista compacta pra dropdowns/selects — só o que a UI precisa.
 * Ordem segue a do JSON.
 */
export const MACROAREA_OPTIONS: readonly MacroareaOption[] = (
  macroareasJson as RawSeed
).macroareas.map((m) => ({
  slug: m.slug,
  name: m.name,
  display_color: m.display_color,
}));

const MACROAREA_SLUGS: ReadonlySet<string> = new Set(
  MACROAREA_OPTIONS.map((m) => m.slug),
);

/**
 * Valida se um slug corresponde a uma macroárea conhecida.
 * Usado no Zod do POST pra rejeitar slugs inventados.
 */
export function isValidMacroareaSlug(slug: string): boolean {
  return MACROAREA_SLUGS.has(slug);
}

export function getMacroareaBySlug(
  slug: string,
): MacroareaOption | undefined {
  return MACROAREA_OPTIONS.find((m) => m.slug === slug);
}
