/**
 * Header de confianza para las llamadas que hace el servidor de Next (SSR).
 *
 * Todo el tráfico de Vercel sale de pocas IPs: sin esto, el rate limit del
 * backend las trataría como un solo cliente y cortaría la tienda en horas pico.
 * INTERNAL_API_KEY es la misma clave que el backend (variable sin NEXT_PUBLIC_:
 * en el navegador es undefined y el header no se manda nunca).
 */
export function internalHeaders() {
  if (typeof window !== 'undefined') return {};
  const key = process.env.INTERNAL_API_KEY;
  return key ? { 'X-Internal-Key': key } : {};
}
