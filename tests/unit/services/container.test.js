import { describe, expect, it } from 'vitest';
import { createServices } from '@/services/container';

describe('composition root', () => {
  it('modo mock: el catálogo responde sin red', async () => {
    const services = createServices({ useMocks: true, supabase: null });
    expect(services.mode).toBe('mock');
    const page = await services.catalog.getProductPage({ category: 'slabs' });
    expect(page.items.every((p) => p.category.slug === 'slabs')).toBe(true);
    expect(services.auth.enabled).toBe(true); // auth mock
  });

  it('modo http sin Supabase: cuentas apagadas, el sitio vende igual', () => {
    const services = createServices({ useMocks: false, supabase: null, apiUrl: 'http://x' });
    expect(services.mode).toBe('http');
    expect(services.auth.enabled).toBe(false);
  });

  it('el catálogo del home nunca rompe aunque el backend falle', async () => {
    const services = createServices({ useMocks: false, supabase: null, apiUrl: 'http://127.0.0.1:1' });
    await expect(services.catalog.getFeatured()).resolves.toEqual([]);
  });
});
