/**
 * Lanzamiento de la tienda
 * ========================
 * Hasta LAUNCH_AT, todas las URLs muestran la página de lanzamiento con la
 * cuenta regresiva. A esa hora la tienda abre sola: cada request vuelve a
 * mirar el reloj, no hace falta deployar ni tocar el admin.
 *
 * Se puede entrar antes con el "Acceso desarrollo" (la misma cookie que el
 * mantenimiento) o con /vista-previa?token=…
 *
 * NEXT_PUBLIC_LAUNCH_AT cambia la fecha sin tocar código (ISO 8601 con zona,
 * ej. 2026-12-01T00:00:00-03:00). Vacía o inválida → la fecha de abajo.
 */
const DEFAULT_LAUNCH_AT = '2026-12-01T00:00:00-03:00'; // 1 de diciembre, 00:00 hora de Argentina

function parseLaunch(value) {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? time : Date.parse(DEFAULT_LAUNCH_AT);
}

export const LAUNCH_AT_MS = parseLaunch(process.env.NEXT_PUBLIC_LAUNCH_AT);

export const isBeforeLaunch = (now = Date.now(), launchAt = LAUNCH_AT_MS) => now < launchAt;

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Lo que falta, partido para el reloj. Nunca negativo. */
export function timeLeft(now, launchAt = LAUNCH_AT_MS) {
  const total = Math.max(0, launchAt - now);
  return {
    total,
    days: Math.floor(total / DAY),
    hours: Math.floor((total % DAY) / HOUR),
    minutes: Math.floor((total % HOUR) / MINUTE),
    seconds: Math.floor((total % MINUTE) / SECOND),
  };
}

/** "1 de diciembre" y "00:00 hs", siempre en hora de Argentina (el server de Vercel corre en UTC). */
export function launchLabels(launchAt = LAUNCH_AT_MS) {
  const date = new Date(launchAt);
  const tz = 'America/Argentina/Buenos_Aires';
  // Por partes: algunos motores ignoran el '2-digit' del día en es-AR ("1/12").
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'numeric', timeZone: tz })
      .formatToParts(date)
      .map(({ type, value }) => [type, value.padStart(2, '0')])
  );
  return {
    day: new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: tz }).format(date),
    time: `${new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(date)} hs`,
    short: `${parts.day}.${parts.month}`,
  };
}
