import { NextResponse } from 'next/server';
import { PREVIEW_COOKIE, checkDevCredentials, devAccessFingerprint } from '@/services/site/siteStatus';

/**
 * POST /acceso-desarrollo  { username, password }
 * Login de desarrollo de la página de mantenimiento: si es el usuario de
 * desarrollo, este navegador ve la tienda aunque esté en mantenimiento (8 h).
 */
export const dynamic = 'force-dynamic';

const SESSION_SECONDS = 60 * 60 * 8;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!(await checkDevCredentials(body.username, body.password))) {
    return NextResponse.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(PREVIEW_COOKIE, await devAccessFingerprint(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: new URL(request.url).protocol === 'https:',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return response;
}
