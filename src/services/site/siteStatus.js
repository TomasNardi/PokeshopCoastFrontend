import { cache } from 'react';
import { cookies } from 'next/headers';
import { env } from '@/config/env';
import { internalHeaders } from '@/services/http/internalHeaders';

/**
 * Estado del sitio (mantenimiento y barra superior)
 * =================================================
 * Lo decide el admin: Configuración de la tienda → Sitio → "Sitio activo".
 * El backend lo publica en GET /site-config/.
 *
 * Falla abierto, igual que Crack: si el backend no responde en 3 s o devuelve
 * cualquier cosa rara, el sitio queda ABIERTO. Una caída del backend nunca
 * tiene que cerrarle la tienda a la gente.
 *
 * `cache` de React: el layout y su generateMetadata comparten una sola
 * consulta por request.
 */

const TIMEOUT_MS = 3000;
const OPEN = Object.freeze({ isActive: true, maintenanceMessage: '', showTopBanner: true, topBannerMessage: '' });

export const PREVIEW_COOKIE = 'psc_preview';

export const getSiteStatus = cache(async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${env.apiUrl}/site-config/`, { cache: 'no-store', signal: controller.signal, headers: internalHeaders() });
    if (!response.ok) return OPEN;
    const data = await response.json();
    return {
      isActive: data.is_active !== false,
      maintenanceMessage: data.maintenance_message || '',
      showTopBanner: data.show_top_banner !== false,
      topBannerMessage: data.top_banner_message || '',
    };
  } catch {
    return OPEN;
  } finally {
    clearTimeout(timer);
  }
});

/** Huella del token de vista previa: la cookie nunca guarda el token en claro. */
export async function previewFingerprint(token) {
  const bytes = new TextEncoder().encode(`psc-preview:${token}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ¿Este navegador puede ver el sitio aunque esté en mantenimiento?
 * Se habilita entrando una vez a /vista-previa?token=<MAINTENANCE_PREVIEW_TOKEN>.
 */
export async function hasPreviewAccess() {
  const token = process.env.MAINTENANCE_PREVIEW_TOKEN;
  if (!token) return false;
  const store = await cookies();
  const value = store.get(PREVIEW_COOKIE)?.value;
  return Boolean(value) && value === (await previewFingerprint(token));
}

/** Lo que el layout necesita saber: mostrar mantenimiento o la tienda. */
export const getMaintenanceState = cache(async () => {
  const status = await getSiteStatus();
  if (status.isActive) return { status, maintenance: false, preview: false };
  const preview = await hasPreviewAccess();
  return { status, maintenance: !preview, preview };
});
