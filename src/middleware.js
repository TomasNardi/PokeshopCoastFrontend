import { NextResponse } from 'next/server';
import { PRESENTATION_MODE } from '@/config/presentation';

/**
 * Modo presentación (NEXT_PUBLIC_HOME_ONLY, ver src/config/presentation.js): solo se muestra la home;
 * cualquier otra sección (tienda, producto, carrito, cuenta, etc.) vuelve a "/".
 */
export function middleware(request) {
  if (!PRESENTATION_MODE || request.nextUrl.pathname === '/') return NextResponse.next();
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  // Deja pasar los assets (_next, imágenes, íconos, cualquier archivo con extensión) y la API.
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
