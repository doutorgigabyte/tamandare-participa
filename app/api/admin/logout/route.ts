import { NextResponse, type NextRequest } from 'next/server';
import { clearAdminCookie } from '@/lib/admin/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  clearAdminCookie();
  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
