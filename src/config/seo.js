/**
 * Configuración de SEO: lo que cambia sin tocar la lógica.
 *
 * - Verificación de Search Console: meta tag (acá) + archivo HTML en /public
 *   (googlec4d88a0b592d5be2.html). Con uno alcanza; tener los dos evita perder
 *   la verificación si se borra cualquiera.
 * - STATIC_PAGES: las páginas fijas que entran al sitemap. Una página nueva
 *   indexable = una línea acá. `catalog: true` usa como lastmod el último cambio
 *   del catálogo (la home, la tienda y el outlet cambian cuando cambia el stock).
 */
import { SITE } from './site';

export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'pjRWRMmnA-hucZfNeIzMod41RteeTt5oOoYs2R-Kpko';

export const STATIC_PAGES = Object.freeze([
  { path: '/', catalog: true },
  { path: '/tienda', catalog: true },
  { path: '/outlet', catalog: true },
  { path: '/envios' },
  { path: '/contacto' },
  { path: '/cambios-y-devoluciones' },
  { path: '/arrepentimiento' },
  { path: '/terminos' },
  { path: '/privacidad' },
]);

/** Rutas privadas o de un solo uso: ni se rastrean ni se indexan. */
export const PRIVATE_PATHS = Object.freeze(['/checkout', '/cuenta', '/carrito', '/vista-previa', '/acceso-desarrollo', '/api/']);

/** Logo para Google (Organization.logo): cuadrado o casi, PNG, mínimo 112 px. */
export const LOGO_PATH = '/brand/pokeshop-logo.png';

/**
 * Open Graph por defecto. Next NO mezcla openGraph entre layout y página: si
 * una página define el suyo, reemplaza al del layout. Por eso las páginas
 * arman el suyo con openGraph() y no pierden siteName/locale.
 */
export function openGraph(overrides = {}) {
  return { type: 'website', locale: SITE.locale, siteName: SITE.name, ...overrides };
}

/** Ruta o URL → URL absoluta del sitio (Google pide absolutas en sitemap y JSON-LD). */
export function absoluteUrl(pathOrUrl) {
  if (typeof pathOrUrl !== 'string' || pathOrUrl === '') return SITE.url;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE.url.replace(/\/+$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}
