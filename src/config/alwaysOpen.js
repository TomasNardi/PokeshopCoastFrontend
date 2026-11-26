/**
 * Rutas que se ven siempre, aunque la tienda esté en mantenimiento o antes de la
 * apertura: las abren los links de los mails (ej. el botón de baja).
 */
export const ALWAYS_OPEN_PATHS = Object.freeze(['/desuscribirse']);

export const isAlwaysOpen = (pathname) => ALWAYS_OPEN_PATHS.includes(pathname || '');
