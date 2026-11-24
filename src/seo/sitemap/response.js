/**
 * Respuestas HTTP del sitemap.
 *
 * Cache en el CDN de Vercel: 1 h fresco y hasta 1 día sirviendo la copia vieja
 * mientras se regenera. Así Google casi nunca espera al backend (Render free se
 * duerme y tarda en despertar).
 *
 * Si el backend falla: 503 + Retry-After, nunca un sitemap vacío. Un 503 Google
 * lo reintenta; un sitemap vacío lo toma como "estas URLs ya no están".
 */
const CACHE = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';

export const xmlResponse = (xml) =>
  new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': CACHE, 'X-Robots-Tag': 'noindex' },
  });

export const unavailableResponse = () =>
  new Response('Sitemap temporalmente no disponible', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '600' },
  });

export const notFoundResponse = () =>
  new Response('Sitemap inexistente', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
