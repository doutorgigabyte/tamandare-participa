/**
 * Auth super-simples pro /admin do MVP 1: senha única em env, cookie HTTP-only.
 *
 * Quando o sistema crescer (multi-moderadora, log de quem moderou o quê), migra
 * pra Supabase Auth com role='moderator' em `profiles`. Por ora, isso resolve.
 *
 * Setup: defina `ADMIN_TOKEN` em .env.local (32+ chars random).
 * Geração: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
 */

import 'server-only';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'tp_admin_authed';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h de sessão

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_TOKEN);
}

export function isAdminAuthed(): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const stored = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return stored === token;
}

export function setAdminCookie(): void {
  const token = process.env.ADMIN_TOKEN;
  if (!token) throw new Error('ADMIN_TOKEN não configurado');
  cookies().set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearAdminCookie(): void {
  cookies().delete(ADMIN_COOKIE_NAME);
}

/**
 * Valida senha submetida e seta cookie. Retorna true se ok.
 * Usa comparação simples — o ADMIN_TOKEN é o segredo, não há janela de timing
 * attack relevante num form de login simples.
 */
export function tryAdminLogin(password: string): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  if (password !== token) return false;
  setAdminCookie();
  return true;
}
