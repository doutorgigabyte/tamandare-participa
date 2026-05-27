import { NextResponse, type NextRequest } from 'next/server';
import { tryAdminLogin } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/login
 * Body: form-data { password: string }  ou JSON { password: string }
 *
 * Redireciona pro /admin com sucesso, ou /admin?login_error=1 em falha.
 * Usado pelo form da página /admin.
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  let password: string | undefined;

  if (contentType.includes('application/json')) {
    const json = (await req.json().catch(() => ({}))) as { password?: string };
    password = json.password;
  } else {
    const form = await req.formData();
    const value = form.get('password');
    if (typeof value === 'string') password = value;
  }

  if (!password) {
    return NextResponse.redirect(new URL('/admin?login_error=missing', req.url), 303);
  }

  const ok = tryAdminLogin(password);
  if (!ok) {
    return NextResponse.redirect(new URL('/admin?login_error=invalid', req.url), 303);
  }

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
