import { NextResponse } from 'next/server';
import { PRESENTATION_MODE } from '@/config/presentation';
import { ALWAYS_OPEN_PATHS } from '@/config/alwaysOpen';

/**
 * Modo presentación (NEXT_PUBLIC_HOME_ONLY, ver src/config/presentation.js): solo se muestra la home;
 * cualquier otra sección (tienda, producto, carrito, cuenta, etc.) vuelve a "/".
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
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
