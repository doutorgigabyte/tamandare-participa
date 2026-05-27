import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * POST /api/elevation
 *
 * Body: { lat: number, lng: number }
 * Resposta: { elevation: number, resolution?: number, source: 'cache' | 'google' }
 *
 * Endpoint de referência arquitetural — adendo v1.1 §7.2.
 *
 * Estratégia:
 *   1. Arredonda lat/lng a 4 decimais (~11m de precisão).
 *   2. Lookup em elevation_cache (cache permanente — altitude não muda).
 *   3. Cache hit  → retorna { source: 'cache' }.
 *   4. Cache miss → chama Google Elevation API.
 *   5. Persiste no cache antes de retornar.
 */
export async function POST(req: Request) {
  let payload: { lat?: unknown; lng?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const lat = Number(payload?.lat);
  const lng = Number(payload?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: 'lat and lng must be numbers' },
      { status: 400 },
    );
  }

  const latR = Number(lat.toFixed(4));
  const lngR = Number(lng.toFixed(4));

  const supabase = createServiceClient();

  // 1. Tenta cache primeiro.
  const { data: cached, error: cacheErr } = await supabase
    .from('elevation_cache')
    .select('elevation_meters, resolution_meters')
    .eq('lat_rounded', latR)
    .eq('lng_rounded', lngR)
    .maybeSingle();

  if (cacheErr) {
    // Não bloqueia — degrada pra chamada Google. Log só.
    // eslint-disable-next-line no-console
    console.error('[elevation] cache lookup error', cacheErr);
  }

  if (cached) {
    return NextResponse.json({
      elevation: Number(cached.elevation_meters),
      resolution: cached.resolution_meters
        ? Number(cached.resolution_meters)
        : undefined,
      source: 'cache' as const,
    });
  }

  // 2. Cache miss → bate na Google.
  const key = process.env.GMAPS_BACKEND_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'GMAPS_BACKEND_KEY not configured' },
      { status: 500 },
    );
  }

  const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${key}`;

  let data: {
    status: string;
    results?: Array<{ elevation: number; resolution: number }>;
    error_message?: string;
  };

  try {
    const res = await fetch(url, { cache: 'no-store' });
    data = await res.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[elevation] fetch error', err);
    return NextResponse.json(
      { error: 'failed to reach elevation api' },
      { status: 502 },
    );
  }

  if (data.status !== 'OK' || !data.results?.[0]) {
    return NextResponse.json(
      {
        error: 'elevation lookup failed',
        status: data.status,
        message: data.error_message,
      },
      { status: 502 },
    );
  }

  const elevation = data.results[0].elevation;
  const resolution = data.results[0].resolution;

  // 3. Salva no cache (fire-and-forget; não bloqueia a resposta se falhar).
  const { error: insertErr } = await supabase.from('elevation_cache').insert({
    lat_rounded: latR,
    lng_rounded: lngR,
    elevation_meters: elevation,
    resolution_meters: resolution,
  });
  if (insertErr) {
    // eslint-disable-next-line no-console
    console.error('[elevation] cache insert error', insertErr);
  }

  return NextResponse.json({
    elevation,
    resolution,
    source: 'google' as const,
  });
}
