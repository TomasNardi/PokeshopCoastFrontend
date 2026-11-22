import { describe, expect, it } from 'vitest';
import {
  canQuote, getShippingMethod, groupOptions, methodForKind, quoteKey, sameOption,
} from '@/services/shipping/shippingMethods';
import { MOCK_SHIPPING_OPTIONS } from '@/services/shipping/shippingRepository.mock';
import { MERCADOPAGO, TRANSFER, routeForMercadoPagoStatus } from '@/services/payments/paymentMethods';
import { MOCK_PAYMENT_CONFIG } from '@/mocks/data/products';

const destination = { shipping_city: 'Mar del Plata', shipping_province: 'Buenos Aires', shipping_zip: '7600' };
const home = { ...destination, shipping_address: 'Av. Colón', shipping_street_number: '1234', shipping_quote: 'q-ca-dom' };

describe('estrategias de envío', () => {
  it('se cotiza recién con CP de 4 dígitos, provincia y ciudad', () => {
    expect(canQuote(destination)).toBe(true);
    expect(canQuote({ ...destination, shipping_zip: '76' })).toBe(false);
    expect(canQuote({ ...destination, shipping_city: '' })).toBe(false);
  });

  it('la cotización cambia con el destino o el carrito, no con el orden de los ítems', () => {
    const items = [{ id: 2, quantity: 1 }, { id: 1, quantity: 3 }];
    expect(quoteKey(destination, items)).toBe(quoteKey(destination, [...items].reverse()));
    expect(quoteKey(destination, items)).not.toBe(quoteKey({ ...destination, shipping_zip: '7601' }, items));
    expect(quoteKey(destination, items)).not.toBe(quoteKey(destination, [{ id: 2, quantity: 2 }, { id: 1, quantity: 3 }]));
  });

  it('retiro en persona no pide nada y viaja como pickup', () => {
    const pickup = getShippingMethod('pickup_store');
    expect(pickup.validate({})).toEqual({});
    expect(pickup.toPayload({})).toMatchObject({ shipping_type: 'pickup', shipping_method: 'pickup_store' });
  });

  it('domicilio pide calle, número y una opción cotizada', () => {
    const method = getShippingMethod('envia_home');
    expect(method.validate(home)).toEqual({});
    expect(Object.keys(method.validate({ ...home, shipping_street_number: '', shipping_quote: '' })).sort())
      .toEqual(['shipping_quote', 'shipping_street_number']);
    expect(method.toPayload({ ...home, shipping_apartment: ' 3° B ' })).toEqual({
      shipping_type: 'home', shipping_method: 'envia_home', shipping_quote: 'q-ca-dom',
      shipping_address: 'Av. Colón', shipping_street_number: '1234', shipping_apartment: '3° B',
      shipping_city: 'Mar del Plata', shipping_province: 'Buenos Aires', shipping_zip: '7600',
      shipping_branch: '', shipping_branch_code: '',
    });
  });

  it('sucursal pide la sucursal elegida, no la calle', () => {
    const method = getShippingMethod('envia_branch');
    const form = { ...destination, shipping_quote: 'q-ca-suc' };
    expect(method.validate(form)).toEqual({ shipping_branch_code: 'Elegí la sucursal donde retirás.' });
    expect(method.toPayload({ ...form, shipping_branch_code: 'MDQ01', shipping_branch: 'Sucursal Centro' }))
      .toMatchObject({ shipping_method: 'envia_branch', shipping_branch_code: 'MDQ01', shipping_quote: 'q-ca-suc' });
  });

  it('agrupa por modalidad y reconoce la misma opción en una cotización nueva', () => {
    const groups = groupOptions(MOCK_SHIPPING_OPTIONS);
    expect(groups.home.map((o) => o.carrier)).toEqual(['correo_argentino', 'andreani']);
    expect(groups.branch).toHaveLength(2);
    expect(sameOption(MOCK_SHIPPING_OPTIONS[2], { ...MOCK_SHIPPING_OPTIONS[2], token: 'otro' })).toBe(true);
    expect(sameOption(MOCK_SHIPPING_OPTIONS[2], MOCK_SHIPPING_OPTIONS[3])).toBe(false);
    expect(methodForKind('branch')).toBe('envia_branch');
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
