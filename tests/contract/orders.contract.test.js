/**
 * Contrato de órdenes y pagos (Mercado Pago / transferencia).
 */
import { describe, expect, it } from 'vitest';
import { useMswServer } from '../msw/server';
import { API, received } from '../msw/handlers';
import { createHttpClient } from '@/services/http/httpClient';
import { createHttpOrderRepository } from '@/services/orders/orderRepository.http';
import { createOrderService, EMPTY_CHECKOUT_FORM } from '@/services/orders/orderService';

useMswServer();

const form = {
  ...EMPTY_CHECKOUT_FORM,
  customer_name: 'Misty',
  customer_email: 'misty@coast.com',
  customer_phone: '2235555555',
  shipping_method: 'branch_normal',
  shipping_address: 'Sucursal Centro',
  shipping_city: 'Mar del Plata',
  shipping_province: 'Buenos Aires',
  shipping_zip: '7600',
};

const build = (token = null) =>
  createOrderService(createHttpOrderRepository(createHttpClient({ baseUrl: API }), { getCustomerToken: async () => token }));

describe('POST /orders/', () => {
  it('Mercado Pago: crea la orden y devuelve el init_point de Checkout Pro', async () => {
    const { order, next } = await build().placeOrder({ form, items: [{ id: 1, quantity: 1 }], origin: 'https://pokeshopcoast.com' });
    expect(order.order_code).toBe('PSC-1');
    expect(next).toEqual({ type: 'redirect', url: expect.stringContaining('mercadopago.com.ar') });
    expect(received.orders[0].body).toMatchObject({
      frontend_origin: 'https://pokeshopcoast.com',
      shipping_type: 'home',
      shipping_method: 'branch_normal',
      shipping_zone: 'ba',
      items: [{ product_id: 1, quantity: 1 }],
    });
  });

  it('con sesión manda el token en X-Customer-Token (no en Authorization)', async () => {
    await build('supabase-jwt').placeOrder({ form, items: [{ id: 1, quantity: 1 }] });
    expect(received.orders[0].customerToken).toBe('supabase-jwt');
  });

  it('como invitado no manda token', async () => {
    await build(null).placeOrder({ form, items: [{ id: 1, quantity: 1 }] });
    expect(received.orders[0].customerToken).toBeNull();
  });

  it('transferencia: sube comprobante y adjunta el token del archivo', async () => {
    const file = new File(['%PDF'], 'comprobante.pdf', { type: 'application/pdf' });
    const { next } = await build().placeOrder({ form: { ...form, payment_method: 'transfer' }, items: [{ id: 1, quantity: 1 }], receiptFile: file });
    expect(received.orders[0].body.receipt_token).toBe('rcpt-1');
    expect(next.href).toContain('transfer=1');
  });

  it('errores de stock de DRF ({ items: [...] }) llegan legibles', async () => {
    const error = await build().placeOrder({ form, items: [{ id: 11, quantity: 1 }] }).catch((e) => e);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Producto 11 sin stock.');
    expect(error.fieldErrors.items).toBe('Producto 11 sin stock.');
  });
});

describe('pagos', () => {
  it('lee la config de envíos y recargos', async () => {
    const config = await build().getPaymentConfig();
    expect(config.shipping_prices.branch.ba.normal).toBeGreaterThan(0);
  });

  it('valida códigos de descuento', async () => {
    await expect(build().validateDiscount('COAST10')).resolves.toMatchObject({ percent: 10 });
    await expect(build().validateDiscount('TRUCHO')).rejects.toThrow('El código no es válido.');
  });

  it('verifica el pago de la back_url de MP contra el backend', async () => {
    const res = await build().verifyPayment({ payment_id: '123', external_reference: '1', status: 'approved' });
    expect(res.order.status).toBe('paid');
  });
});
