import { cache } from 'react';
import { cookies } from 'next/headers';
import { env } from '@/config/env';
import { isBeforeLaunch } from '@/config/launch';
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
const OPEN = Object.freeze({ isActive: true, maintenanceTitle: '', maintenanceMessage: '', showTopBanner: true, topBannerMessage: '' });

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
      maintenanceTitle: data.maintenance_title || '',
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
  return sha256Hex(`psc-preview:${token}`);
}

/**
 * Acceso de desarrollo desde la página de mantenimiento ("Acceso desarrollo").
 * Un solo usuario. La contraseña no está en el código: solo su huella SHA-256.
 */
const DEV_ACCESS = Object.freeze({
  username: 'martin',
  passwordHash: 'd08126b919180c6f1c13b17b27f20b90d02fae0042c87007e63583c1866603b1',
});

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function checkDevCredentials(username, password) {
  if (String(username || '').trim().toLowerCase() !== DEV_ACCESS.username) return false;
  return (await sha256Hex(`psc-dev:${password || ''}`)) === DEV_ACCESS.passwordHash;
}

/** Valor de la cookie que deja pasar al usuario de desarrollo. */
export const devAccessFingerprint = () => previewFingerprint(`dev:${DEV_ACCESS.username}:${DEV_ACCESS.passwordHash}`);

/**
 * ¿Este navegador puede ver el sitio aunque esté en mantenimiento?
 * Dos llaves, la misma cookie:
 *   - el login de desarrollo de la página de mantenimiento
 *   - /vista-previa?token=<MAINTENANCE_PREVIEW_TOKEN> (si la variable existe)
 */
export async function hasPreviewAccess() {
  const store = await cookies();
  const value = store.get(PREVIEW_COOKIE)?.value;
  if (!value) return false;
  if (value === (await devAccessFingerprint())) return true;
  const token = process.env.MAINTENANCE_PREVIEW_TOKEN;
  return Boolean(token) && value === (await previewFingerprint(token));
}

/**
 * Qué pantalla corresponde, sin tocar cookies ni red (se testea aparte).
 * Hasta la apertura, la de lanzamiento reemplaza a todo (también al
 * mantenimiento del admin). Después, todo como siempre: el admin apaga el
 * sitio y se ve la página de mantenimiento. La vista previa (acceso
 * desarrollo) pasa por las dos.
 */
export function resolveGate({ isActive, beforeLaunch, preview }) {
  if (preview) return { maintenance: false, launch: false };
  if (beforeLaunch) return { maintenance: false, launch: true };
  return { maintenance: !isActive, launch: false };
}

/**
 * Lo que el layout necesita saber: mantenimiento, lanzamiento o la tienda.
 * `gated`: el público no ve la tienda todavía (para la barra de vista previa y el noindex).
 */
export const getMaintenanceState = cache(async () => {
  const status = await getSiteStatus();
  const beforeLaunch = isBeforeLaunch();
  const gated = !status.isActive || beforeLaunch;
  // Las cookies solo se leen cuando hace falta: abierta la tienda, las páginas no dependen de ellas.
  const preview = gated ? await hasPreviewAccess() : false;
  return { status, gated, preview, beforeLaunch, ...resolveGate({ isActive: status.isActive, beforeLaunch, preview }) };
});
