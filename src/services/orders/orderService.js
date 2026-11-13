import { getShippingMethod } from '../shipping/shippingMethods';
import { getPaymentMethod } from '../payments/paymentMethods';
import { isValidEmail } from '@/domain/passwordRules';

export const EMPTY_CHECKOUT_FORM = Object.freeze({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_method: '',
  shipping_address: '',
  shipping_city: '',
  shipping_province: '',
  shipping_zip: '',
  payment_method: 'mercadopago',
  notes: '',
});

/** Errores por campo. {} = válido. Lo de envío lo valida la estrategia elegida. */
export function validateCheckout(form, { receipt } = {}) {
  const errors = {};
  if (!form.customer_name?.trim()) errors.customer_name = 'Ingresá tu nombre y apellido.';
  if (!isValidEmail(form.customer_email)) errors.customer_email = 'Ingresá un email válido.';
  const phoneDigits = (form.customer_phone || '').replace(/\D/g, '');
  if (phoneDigits.length < 8) errors.customer_phone = 'Ingresá un teléfono de contacto.';

  const shipping = getShippingMethod(form.shipping_method);
  if (!shipping) errors.shipping_method = 'Elegí cómo querés recibir tu pedido.';
  else Object.assign(errors, shipping.validate(form));

  const payment = getPaymentMethod(form.payment_method);
  if (!payment) errors.payment_method = 'Elegí un medio de pago.';
  else if (payment.requiresReceipt && !receipt) errors.receipt = 'Adjuntá el comprobante de la transferencia.';

  return errors;
}

/**
 * Arma el body de POST /orders/ (contrato de Crack). Puro: no lee window,
 * el origen llega por parámetro. El backend solo confía en product_id+quantity
 * y recalcula precios, stock y descuentos.
 */
export function buildOrderPayload(form, items, { discountCode = '', receipt = null, origin = '' } = {}) {
  const shipping = getShippingMethod(form.shipping_method);
  if (!shipping) throw new Error(`Método de envío desconocido: ${form.shipping_method}`);

  return {
    customer_name: form.customer_name.trim(),
    customer_email: form.customer_email.trim().toLowerCase(),
    customer_phone: form.customer_phone.trim(),
    ...shipping.toPayload(form),
    payment_method: form.payment_method,
    discount_code: discountCode || '',
    notes: form.notes?.trim() || '',
    ...(origin ? { frontend_origin: origin } : {}),
    ...(receipt
      ? { receipt_token: receipt.token, receipt_name: receipt.name, receipt_content_type: receipt.content_type }
      : {}),
    items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
  };
}

export function createOrderService(repository) {
  return {
    getPaymentConfig: () => repository.getPaymentConfig(),
    validateDiscount: (code) => repository.validateDiscount(code),
    verifyPayment: (params) => repository.verifyPayment(params),

    /**
     * Valida, sube el comprobante si el medio lo pide, crea la orden y devuelve
     * el paso siguiente que decide la estrategia de pago.
     * @returns {Promise<{ order: object, next: { type: 'redirect'|'route', url?: string, href?: string } }>}
     */
    async placeOrder({ form, items, discountCode, receiptFile, origin }) {
      const payment = getPaymentMethod(form.payment_method);
      const errors = validateCheckout(form, { receipt: payment?.requiresReceipt ? receiptFile : true });
      if (Object.keys(errors).length > 0) {
        throw Object.assign(new Error('Revisá los datos marcados.'), { fieldErrors: errors });
      }
      if (!items?.length) throw new Error('Tu carrito está vacío.');

      const receipt = payment.requiresReceipt ? await repository.uploadReceipt(receiptFile) : null;
      const response = await repository.createOrder(
        buildOrderPayload(form, items, { discountCode, receipt, origin })
      );
      return { order: response?.order || response, next: payment.nextStep(response) };
    },
  };
}
