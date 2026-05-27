/**
 * Tipos do banco Supabase.
 *
 * Placeholder. Gerar via:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 *
 * Por enquanto exportamos um Database "any" pra não bloquear o desenvolvimento.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

export type Macroarea = {
  slug: string;
  name: string;
  display_color: string | null;
  description_plain: string | null;
  description_official: string | null;
  geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  changes_from_current: string | null;
  attention_points: string[] | null;
};

export type Contribution = {
  id: string;
  user_id: string | null;
  is_anonymous: boolean;
  category: string;
  macroarea_slug: string | null;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  location_address: string | null;
  title: string | null;
  body: string;
  sentiment: 'agree' | 'agree_with_reservations' | 'disagree' | null;
  attachments: Array<{ url: string; type: string; name: string }>;
  status: 'pending' | 'published' | 'flagged' | 'spam';
  moderator_notes: string | null;
  hash_integrity: string | null;
  created_at: string;
  published_at: string | null;
};

export type ChatRole = 'user' | 'assistant' | 'system';
