import { ApiError } from '../http/ApiError';
import { MOCK_PAYMENT_CONFIG } from '@/mocks/data/products';

const DISCOUNT_CODES = { COAST10: { code: 'COAST10', percent: 10, fixed: 0, expires_at: null } };

/**
 * Órdenes en memoria. Para Mercado Pago simula la vuelta de Checkout Pro
 * apuntando directo a la back_url de éxito, así el flujo completo se puede
 * recorrer sin backend.
 */
export function createMockOrderRepository() {
  let sequence = 1000;
  const orders = new Map();

  return {
    async createOrder(payload) {
      if (!payload?.items?.length) {
        throw new ApiError('El carrito está vacío.', { status: 400, data: { items: ['El carrito está vacío.'] } });
      }
      sequence += 1;
      const order = {
        id: sequence,
        order_code: `PSC-${sequence}`,
        status: payload.payment_method === 'transfer' ? 'awaiting_transfer' : 'pending_payment',
        customer_email: payload.customer_email,
      };
      orders.set(order.id, { ...order, payload });

      if (payload.payment_method === 'mercadopago') {
        const origin = payload.frontend_origin || '';
        const qs = new URLSearchParams({
          status: 'approved',
          payment_id: `mock-${sequence}`,
          external_reference: String(order.id),
        });
        return { order, checkout: { init_point: `${origin}/checkout/confirmacion?${qs}` } };
      }
      return { order };
    },
    async savePendingCheckout(payload) {
      return { token: payload?.token || `mock-checkout-${Date.now()}` };
    },
    async recoverCheckout() {
      throw new ApiError('Este link ya no está disponible.', { status: 404 });
    },
    async uploadReceipt(file) {
      return { token: `receipt-${Date.now()}`, name: file?.name || 'comprobante', content_type: file?.type || '', size: file?.size || 0 };
    },
    getPaymentConfig: async () => MOCK_PAYMENT_CONFIG,
    async verifyPayment({ external_reference, status = 'approved' }) {
      const order = orders.get(Number(external_reference));
      return {
        status,
        order: order
          ? { id: order.id, order_code: order.order_code, status: 'paid' }
          : { id: Number(external_reference) || 0, order_code: `PSC-${external_reference}`, status: 'paid' },
      };
    },
    async validateDiscount(code) {
      const found = DISCOUNT_CODES[String(code || '').trim().toUpperCase()];
      if (!found) throw new ApiError('El código no es válido.', { status: 400, data: { code: ['El código no es válido.'] } });
      return found;
    },
  };
}
