/**
 * URLs de la tienda vieja (Tiendanube)
 * ====================================
 * Google todavía tiene miles de URLs del formato viejo (/singles-pokemon-tcg/…,
 * /productos/…, /booster-box/…). Sin esto daban 404 y se perdía lo indexado.
 * El middleware le pregunta al backend (/seo/resolve/) a dónde van y responde
 * con un 301: producto equivalente o la tienda filtrada (ver apps/seo/legacy.py).
 *
 * Solo se consulta para rutas que NO son de este sitio: las secciones de abajo
 * no pagan el viaje al backend. Una sección nueva en src/app = una línea acá.
 */
export const SITE_SECTIONS = Object.freeze([
  'acceso-desarrollo',
  'arrepentimiento',
  'cambios-y-devoluciones',
  'carrito',
  'checkout',
  'contacto',
  'cuenta',
  'desuscribirse',
  'envios',
  'outlet',
  'privacidad',
  'sitemaps',
  'terminos',
  'tienda',
  'vista-previa',
]);

/** true si la ruta puede ser de la tienda vieja (y vale la pena preguntar). */
export function isLegacyCandidate(pathname) {
  const first = String(pathname || '').split('/').filter(Boolean)[0];
  if (!first) return false;
  return !SITE_SECTIONS.includes(first.toLowerCase());
}

/** Destino nuevo según el backend, o null. Nunca rompe: ante error, sigue el 404 normal. */
export async function resolveLegacyPath(pathname, { apiUrl, headers = {}, fetchImpl = globalThis.fetch, timeoutMs = 4000 } = {}) {
  try {
    const url = `${apiUrl}/seo/resolve/?path=${encodeURIComponent(pathname)}`;
    const res = await fetchImpl(url, { headers, signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const to = typeof data?.to === 'string' ? data.to : '';
    // Solo rutas internas: el destino nunca puede sacar al visitante del sitio.
    return to.startsWith('/') && !to.startsWith('//') && to !== pathname ? to : null;
  } catch {
    return null;
  }
}
