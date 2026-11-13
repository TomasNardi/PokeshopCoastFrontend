import { describe, expect, it } from 'vitest';
import { getShippingMethod, quoteShipping, shippingZoneFor } from '@/services/shipping/shippingMethods';
import { MERCADOPAGO, TRANSFER, routeForMercadoPagoStatus } from '@/services/payments/paymentMethods';
import { MOCK_PAYMENT_CONFIG } from '@/mocks/data/products';

const address = { shipping_address: 'Av. Costanera 123', shipping_city: 'Mar del Plata', shipping_province: 'Buenos Aires', shipping_zip: '7600' };

describe('estrategias de envío', () => {
  it('zona tarifaria: BA y CABA son "ba", el resto "province"', () => {
    expect(shippingZoneFor('CABA')).toBe('ba');
    expect(shippingZoneFor('Córdoba')).toBe('province');
  });

  it('retiro no pide dirección y cuesta 0', () => {
    const pickup = getShippingMethod('pickup_store');
    expect(pickup.validate({})).toEqual({});
    expect(quoteShipping('pickup_store', {}, MOCK_PAYMENT_CONFIG)).toBe(0);
    expect(pickup.toPayload({})).toMatchObject({ shipping_type: 'pickup', shipping_method: 'pickup_store' });
  });

  it('domicilio valida dirección completa y CP de 4 dígitos', () => {
    const errors = getShippingMethod('home').validate({ ...address, shipping_zip: '76' });
    expect(Object.keys(errors)).toEqual(['shipping_zip']);
    expect(getShippingMethod('home').validate(address)).toEqual({});
  });

  it('cotiza por zona según la config del backend', () => {
    expect(quoteShipping('branch_express', address, MOCK_PAYMENT_CONFIG)).toBe(9500);
    expect(quoteShipping('home', { ...address, shipping_province: 'Salta' }, MOCK_PAYMENT_CONFIG)).toBe(11900);
    expect(quoteShipping('home', { shipping_province: '' }, MOCK_PAYMENT_CONFIG)).toBeNull();
  });

  it('serializa sucursal con el contrato de Crack (shipping_type "home")', () => {
    expect(getShippingMethod('branch_normal').toPayload(address)).toEqual({
      shipping_type: 'home',
      shipping_method: 'branch_normal',
      shipping_zone: 'ba',
      shipping_branch: 'Sucursal de correo',
      ...address,
    });
  });
});

describe('estrategias de pago', () => {
  it('Mercado Pago redirige al init_point', () => {
    expect(MERCADOPAGO.nextStep({ checkout: { init_point: 'https://mp/x' } })).toEqual({ type: 'redirect', url: 'https://mp/x' });
  });

  it('Mercado Pago sin init_point es un error claro', () => {
    expect(() => MERCADOPAGO.nextStep({ order: {} })).toThrow(/Mercado Pago/);
  });

  it('recargo de tarjeta solo si el backend lo habilita', () => {
    expect(MERCADOPAGO.surchargePercent(MOCK_PAYMENT_CONFIG)).toBe(10);
    expect(MERCADOPAGO.surchargePercent({ card_surcharge_enabled: false, card_surcharge_percent: 10 })).toBe(0);
  });

  it('transferencia navega a la confirmación con el código', () => {
    const next = TRANSFER.nextStep({ order: { id: 7, order_code: 'PSC-7' } });
    expect(next.type).toBe('route');
    expect(next.href).toBe('/checkout/confirmacion?order=7&code=PSC-7&transfer=1');
  });

  it.each([
    ['approved', '/checkout/confirmacion'],
    ['in_process', '/checkout/pendiente'],
    ['rejected', '/checkout/error'],
  ])('back_url de MP %s → %s', (status, route) => expect(routeForMercadoPagoStatus(status)).toBe(route));
});
