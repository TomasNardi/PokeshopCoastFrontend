import { NextResponse } from 'next/server';
import { PRESENTATION_MODE } from '@/config/presentation';
import { ALWAYS_OPEN_PATHS } from '@/config/alwaysOpen';
import { env } from '@/config/env';
import { isLegacyCandidate, resolveLegacyPath } from '@/seo/legacyRedirect';

/**
 * Modo presentación (NEXT_PUBLIC_HOME_ONLY, ver src/config/presentation.js): solo se muestra la home;
 * cualquier otra sección (tienda, producto, carrito, cuenta, etc.) vuelve a "/".
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  // URLs de la tienda vieja (Tiendanube) → 301 a su equivalente (ver seo/legacyRedirect.js).
  if (isLegacyCandidate(pathname)) {
    const key = process.env.INTERNAL_API_KEY;
    const target = await resolveLegacyPath(pathname, { apiUrl: env.apiUrl, headers: key ? { 'X-Internal-Key': key } : {} });
    if (target) return NextResponse.redirect(new URL(target, request.url), 301);
  }
  // El layout lee la ruta de acá: las de ALWAYS_OPEN_PATHS se ven aunque la tienda esté cerrada.
  const headers = new Headers(request.headers);
  headers.set('x-pk-path', pathname);
  const next = () => NextResponse.next({ request: { headers } });
  // /vista-previa y /acceso-desarrollo: entrar con el sitio en mantenimiento.
  if (!PRESENTATION_MODE || pathname === '/' || pathname === '/vista-previa' || pathname === '/acceso-desarrollo') return next();
  if (ALWAYS_OPEN_PATHS.includes(pathname)) return next();
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  // Deja pasar los assets (_next, imágenes, íconos, cualquier archivo con extensión) y la API.
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
