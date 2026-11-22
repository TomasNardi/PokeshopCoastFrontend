/**
 * Integración contra el backend REAL (solo lectura + validaciones sin efectos).
 *
 *   INTEGRATION_API_URL=http://localhost:8000/api/v1 npm run test:integration
 *
 * Sin la variable, vitest excluye esta carpeta. Son los mismos escenarios de
 * tests/contract: si acá falla y allá pasa, el backend cambió el contrato.
 * No crea órdenes ni manda mails: es seguro correrlo contra staging.
 */
import { describe, expect, it } from 'vitest';
import { createServices } from '@/services/container';
import { productView } from '@/domain/product';

const apiUrl = process.env.INTEGRATION_API_URL;

describe.skipIf(!apiUrl)('backend real', () => {
  const services = createServices({ useMocks: false, apiUrl, supabase: null });

  it('lista productos paginados (DRF)', async () => {
    const page = await services.catalog.getProductPage({});
    expect(page.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(page.items)).toBe(true);
  });

  it('cada producto respeta el shape que pinta la card', async () => {
    const { items } = await services.catalog.getProductPage({});
    for (const product of items) {
      expect(product).toHaveProperty('slug');
      expect(product).toHaveProperty('price_ars');
      expect(product).toHaveProperty('in_stock');
      const view = productView(product);
      expect(Number.isFinite(view.price)).toBe(true);
    }
  });

  it('el detalle de un producto existe y un slug inexistente da null', async () => {
    const { items } = await services.catalog.getProductPage({});
    if (items[0]) expect((await services.catalog.getProduct(items[0].slug)).id).toBe(items[0].id);
    expect(await services.catalog.getProduct('__no-existe__')).toBeNull();
  });

  it('las condiciones del backend son las que conoce el front', async () => {
    const conditions = await services.catalog.getConditions();
    const { getCondition } = await import('@/domain/conditions');
    for (const c of conditions) expect(getCondition(c.name).tone).not.toBe('bg-coast-gray text-white');
  });

  it('config de pagos trae precios de envío', async () => {
    const config = await services.orders.getPaymentConfig();
    expect(config).toHaveProperty('shipping');
  });

  it('un código de descuento inventado se rechaza con mensaje', async () => {
    await expect(services.orders.validateDiscount('__TRUCHO__')).rejects.toHaveProperty('message');
  });
});
