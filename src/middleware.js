import { NextResponse } from 'next/server';

/**
 * Modo presentación: con NEXT_PUBLIC_HOME_ONLY=true solo se muestra la home;
 * cualquier otra sección (tienda, producto, carrito, cuenta, etc.) vuelve a "/".
 * Para habilitar todo el sitio: borrar la variable o ponerla en false.
 */
const HOME_ONLY = process.env.NEXT_PUBLIC_HOME_ONLY === 'true';

export function middleware(request) {
  if (!HOME_ONLY || request.nextUrl.pathname === '/') return NextResponse.next();
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  // Deja pasar los assets (_next, imágenes, íconos, cualquier archivo con extensión) y la API.
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
