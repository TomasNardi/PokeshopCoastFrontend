'use client';
import { useEffect, useState } from 'react';
import { timeLeft } from '@/config/launch';

const UNITS = [
  { key: 'days', label: 'Días', short: 'Días' },
  { key: 'hours', label: 'Horas', short: 'Hs' },
  { key: 'minutes', label: 'Minutos', short: 'Min' },
  { key: 'seconds', label: 'Segundos', short: 'Seg' },
];

const pad = (n) => String(n).padStart(2, '0');

/** Al llegar a cero, recarga: el server ya sirve la tienda. Pausa breve para que se lea "¡Abrimos!". */
const RELOAD_DELAY_MS = 1800;

/**
 * Cuenta regresiva al lanzamiento.
 * `serverNow`: la hora del server al renderizar. El primer pintado usa esa
 * hora (mismo HTML en server y cliente); después manda el reloj del navegador.
 */
export default function Countdown({ launchAt, serverNow }) {
  const [now, setNow] = useState(serverNow);
  const left = timeLeft(now, launchAt);
  const done = left.total === 0;

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!done) return undefined;
    const id = setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
    return () => clearTimeout(id);
  }, [done]);

  if (done) {
    return (
      <div className="launch-countdown is-done" role="status">
        <span className="launch-countdown__done">¡Abrimos!</span>
        <span className="launch-countdown__done-sub">Entrando a la tienda…</span>
      </div>
    );
  }

  // Para lectores de pantalla: un resumen que cambia por minuto, no por segundo.
  const spoken = `Faltan ${left.days} días, ${left.hours} horas y ${left.minutes} minutos`;

  return (
    <div className="launch-countdown" role="timer" aria-label={spoken}>
      {UNITS.map(({ key, label, short }, index) => (
        <div key={key} className="launch-countdown__cell" aria-hidden="true">
          {index > 0 && <span className="launch-countdown__sep">:</span>}
          <span className="launch-countdown__value">
            {/* La key cambia con el número: dispara la animación del dígito nuevo. */}
            <span key={left[key]} className="launch-countdown__digits" suppressHydrationWarning>
              {pad(left[key])}
            </span>
          </span>
          <span className="launch-countdown__label">
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
