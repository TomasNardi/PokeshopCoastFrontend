import { NextResponse } from 'next/server';
import { PREVIEW_COOKIE, previewFingerprint } from '@/services/site/siteStatus';

/**
 * Vista previa con el sitio en mantenimiento
 * ==========================================
 *   /vista-previa?token=<MAINTENANCE_PREVIEW_TOKEN>  → este navegador ve la tienda (30 días)
 *   /vista-previa?salir=1                            → vuelve a ver el mantenimiento
 *
 * MAINTENANCE_PREVIEW_TOKEN es una variable del servidor (sin NEXT_PUBLIC_):
 * nunca llega al navegador. La cookie guarda una huella del token, no el token.
 */
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const home = NextResponse.redirect(new URL('/', url));
  home.headers.set('Cache-Control', 'no-store');
  home.headers.set('X-Robots-Tag', 'noindex');

  if (url.searchParams.has('salir')) {
    home.cookies.delete(PREVIEW_COOKIE);
    return home;
  }

  const expected = process.env.MAINTENANCE_PREVIEW_TOKEN;
  const token = url.searchParams.get('token') || '';
  // Sin token configurado o con uno incorrecto: a la home, sin pistas.
  if (!expected || token !== expected) return home;

  home.cookies.set(PREVIEW_COOKIE, await previewFingerprint(expected), {
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return home;
}
