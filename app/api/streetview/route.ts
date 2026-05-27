import { NextResponse } from 'next/server';

/**
 * GET /api/streetview?lat=&lng=&heading=
 *
 * Preview Street View da localização da contribuição.
 *
 * Quando implementado (adendo v1.1 §1.1 + §3 + §4.4):
 *   1. Arredonda coords a 4 decimais (~11m).
 *   2. Lookup em streetview_cache. Se has_imagery && storage_path → retorna URL Supabase.
 *   3. Cache miss → chama Street View Static API com GMAPS_BACKEND_KEY.
 *      URL: https://maps.googleapis.com/maps/api/streetview?size=600x300&location=lat,lng&heading=H&key=KEY
 *   4. Baixa imagem, salva no Supabase Storage (bucket 'streetview-cache').
 *   5. Insere registro em streetview_cache (has_imagery true/false).
 *   6. Retorna URL pública da imagem.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'not implemented yet', stub: true },
    { status: 501 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'not implemented yet', stub: true },
    { status: 501 },
  );
}
