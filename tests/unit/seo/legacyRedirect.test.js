import { describe, expect, it, vi } from 'vitest';
import { isLegacyCandidate, resolveLegacyPath } from '@/seo/legacyRedirect';

describe('isLegacyCandidate', () => {
  it('pregunta solo por rutas que no son del sitio', () => {
    expect(isLegacyCandidate('/singles-pokemon-tcg/undaunted')).toBe(true);
    expect(isLegacyCandidate('/productos/charizard')).toBe(true);
    expect(isLegacyCandidate('/')).toBe(false);
    expect(isLegacyCandidate('/tienda/charizard-ex')).toBe(false);
    expect(isLegacyCandidate('/cuenta/pedidos')).toBe(false);
  });
});

describe('resolveLegacyPath', () => {
  const ok = (body) => vi.fn().mockResolvedValue({ ok: true, json: async () => body });

  it('devuelve el destino interno del backend', async () => {
    const fetchImpl = ok({ to: '/tienda/charizard-ex' });
    await expect(resolveLegacyPath('/productos/x', { apiUrl: 'http://api', fetchImpl })).resolves.toBe('/tienda/charizard-ex');
    expect(fetchImpl.mock.calls[0][0]).toBe('http://api/seo/resolve/?path=%2Fproductos%2Fx');
  });

  it('nunca redirige afuera del sitio', async () => {
    await expect(resolveLegacyPath('/x/y', { apiUrl: 'a', fetchImpl: ok({ to: 'https://evil.com' }) })).resolves.toBeNull();
    await expect(resolveLegacyPath('/x/y', { apiUrl: 'a', fetchImpl: ok({ to: '//evil.com' }) })).resolves.toBeNull();
  });

  it('ante 404 o error de red sigue el 404 normal', async () => {
    await expect(resolveLegacyPath('/x', { apiUrl: 'a', fetchImpl: vi.fn().mockResolvedValue({ ok: false }) })).resolves.toBeNull();
    await expect(resolveLegacyPath('/x', { apiUrl: 'a', fetchImpl: vi.fn().mockRejectedValue(new Error('down')) })).resolves.toBeNull();
  });
});
