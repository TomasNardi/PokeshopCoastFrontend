import { describe, expect, it } from 'vitest';
import { isBeforeLaunch, launchLabels, timeLeft } from '@/config/launch';
import { resolveGate } from '@/services/site/siteStatus';

const LAUNCH = Date.parse('2026-12-01T00:00:00-03:00');

describe('lanzamiento', () => {
  it('la tienda abre sola a las 00:00 del 1/12 (hora de Argentina)', () => {
    expect(isBeforeLaunch(LAUNCH - 1, LAUNCH)).toBe(true);
    expect(isBeforeLaunch(LAUNCH, LAUNCH)).toBe(false);
    expect(new Date(LAUNCH).toISOString()).toBe('2026-12-01T03:00:00.000Z');
  });

  it('timeLeft parte lo que falta en días, horas, minutos y segundos; nunca negativo', () => {
    const left = timeLeft(LAUNCH - ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000, LAUNCH);
    expect(left).toMatchObject({ days: 2, hours: 3, minutes: 4, seconds: 5 });
    expect(timeLeft(LAUNCH + 5000, LAUNCH)).toMatchObject({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('las etiquetas salen en hora de Argentina aunque el server corra en UTC', () => {
    expect(launchLabels(LAUNCH)).toEqual({ day: '1 de diciembre', time: '00:00 hs', short: '01.12' });
  });
});

describe('resolveGate', () => {
  it('antes de la apertura: lanzamiento; después: la tienda', () => {
    expect(resolveGate({ isActive: true, beforeLaunch: true, preview: false })).toEqual({ maintenance: false, launch: true });
    expect(resolveGate({ isActive: true, beforeLaunch: false, preview: false })).toEqual({ maintenance: false, launch: false });
  });

  it('hasta la apertura el lanzamiento reemplaza también al mantenimiento; después vuelve el de siempre', () => {
    expect(resolveGate({ isActive: false, beforeLaunch: true, preview: false })).toEqual({ maintenance: false, launch: true });
    expect(resolveGate({ isActive: false, beforeLaunch: false, preview: false })).toEqual({ maintenance: true, launch: false });
  });

  it('con acceso desarrollo se ve la tienda en los dos casos', () => {
    expect(resolveGate({ isActive: true, beforeLaunch: true, preview: true })).toEqual({ maintenance: false, launch: false });
    expect(resolveGate({ isActive: false, beforeLaunch: true, preview: true })).toEqual({ maintenance: false, launch: false });
  });
});
