import { describe, expect, it, vi } from 'vitest';
import { EMPTY_CHECKOUT_FORM, buildOrderPayload, createOrderService, validateCheckout } from '@/services/orders/orderService';
import { createMockOrderRepository } from '@/services/orders/orderRepository.mock';

const form = {
  ...EMPTY_CHECKOUT_FORM,
  customer_name: 'Ash Ketchum',
  customer_email: ' Ash@Coast.com ',
  customer_phone: '11 5555-5555',
  shipping_method: 'home',
  shipping_address: 'Costanera 1',
  shipping_city: 'Pinamar',
  shipping_province: 'Buenos Aires',
  shipping_zip: '7167',
};
const items = [{ id: 1, quantity: 2, final_price: '1000' }];

describe('validateCheckout', () => {
  it('form completo → sin errores', () => {
    expect(validateCheckout(form)).toEqual({});
  });

  it('marca datos personales y método de envío faltantes', () => {
    const errors = validateCheckout(EMPTY_CHECKOUT_FORM);
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(['customer_name', 'customer_email', 'customer_phone', 'shipping_method']));
  });

  it('delega la validación de dirección a la estrategia de envío', () => {
    expect(validateCheckout({ ...form, shipping_city: '' })).toHaveProperty('shipping_city');
    expect(validateCheckout({ ...form, shipping_method: 'pickup_store', shipping_city: '' })).toEqual({});
  });

  it('transferencia exige comprobante', () => {
    expect(validateCheckout({ ...form, payment_method: 'transfer' })).toHaveProperty('receipt');
  });
});

describe('buildOrderPayload', () => {
  it('arma el body de POST /orders/ con el contrato de Crack', () => {
    const payload = buildOrderPayload(form, items, { discountCode: 'COAST10', origin: 'https://pokeshopcoast.com' });
    expect(payload).toMatchObject({
      customer_email: 'ash@coast.com',
      shipping_type: 'home',
      shipping_method: 'home',
      shipping_zone: 'ba',
      payment_method: 'mercadopago',
      discount_code: 'COAST10',
      frontend_origin: 'https://pokeshopcoast.com',
      items: [{ product_id: 1, quantity: 2 }],
    });
  });

  it('nunca manda precios: el backend los recalcula', () => {
    const payload = buildOrderPayload(form, items);
    expect(JSON.stringify(payload.items)).not.toContain('price');
  });

  it('adjunta el comprobante de transferencia', () => {
    const payload = buildOrderPayload({ ...form, payment_method: 'transfer' }, items, {
      receipt: { token: 't', name: 'c.pdf', content_type: 'application/pdf' },
    });
    expect(payload).toMatchObject({ receipt_token: 't', receipt_name: 'c.pdf' });
  });
});

describe('orderService.placeOrder', () => {
  it('con Mercado Pago devuelve un redirect al checkout', async () => {
    const service = createOrderService(createMockOrderRepository());
    const { order, next } = await service.placeOrder({ form, items, origin: 'http://localhost:3000' });
    expect(order.order_code).toMatch(/^PSC-/);
    expect(next.type).toBe('redirect');
    expect(next.url).toContain('/checkout/confirmacion');
  });

  it('con transferencia sube el comprobante antes de crear la orden', async () => {
    const repo = createMockOrderRepository();
    const upload = vi.spyOn(repo, 'uploadReceipt');
    const create = vi.spyOn(repo, 'createOrder');
    const service = createOrderService(repo);
    const file = new File(['x'], 'comprobante.pdf', { type: 'application/pdf' });

    const { next } = await service.placeOrder({ form: { ...form, payment_method: 'transfer' }, items, receiptFile: file });

    expect(upload).toHaveBeenCalledWith(file);
    expect(create.mock.calls[0][0].receipt_token).toMatch(/^receipt-/);
    expect(upload.mock.invocationCallOrder[0]).toBeLessThan(create.mock.invocationCallOrder[0]);
    expect(next.type).toBe('route');
  });

  it('form inválido no llega al repositorio y trae errores por campo', async () => {
    const repo = createMockOrderRepository();
    const create = vi.spyOn(repo, 'createOrder');
    await expect(createOrderService(repo).placeOrder({ form: EMPTY_CHECKOUT_FORM, items })).rejects.toMatchObject({
      fieldErrors: expect.objectContaining({ customer_name: expect.any(String) }),
    });
    expect(create).not.toHaveBeenCalled();
  });
});
