import { CUSTOMER_TOKEN_HEADER } from '../customer/customerRepository.http';

/**
 * Órdenes y pagos contra Django (contrato de Crack).
 *   createOrder(payload) → { order, checkout? }
 *   uploadReceipt(file) → { token, name, content_type, size }
 *   getPaymentConfig() → { card_surcharge_*, shipping, free_shipping, transfer }
 *   verifyPayment({ payment_id, external_reference, ... }) → { status, order }
 *   validateDiscount(code) → { code, percent, fixed, expires_at }
 *   savePendingCheckout(payload) → { token }   (carrito abandonado: el recordatorio por mail)
 *   recoverCheckout(token) → { token, finished, items: [{product_id, quantity}], form, discount_code }
 *
 * @param {ReturnType<import('../http/httpClient').createHttpClient>} http
 * @param {{ getCustomerToken: () => Promise<string|null> }} deps
 */
export function createHttpOrderRepository(http, { getCustomerToken = async () => null } = {}) {
  return {
    async createOrder(payload) {
      // Con sesión abierta, la orden queda asociada a la cuenta del comprador.
      const token = await getCustomerToken();
      return http.post('/orders/', payload, {
        headers: token ? { [CUSTOMER_TOKEN_HEADER]: token } : {},
      });
    },
    uploadReceipt(file) {
      const body = new FormData();
      body.append('file', file);
      return http.post('/orders/receipt/', body);
    },
    getPaymentConfig: () => http.get('/payments/config/', { cache: 'no-store' }),
    verifyPayment: (params) => http.post('/payments/verify/', params),
    validateDiscount: (code) => http.post('/payments/validate-discount/', { code }),
    savePendingCheckout: (payload) => http.post('/orders/pending-checkout/', payload),
    recoverCheckout: (token) => http.get(`/orders/pending-checkout/${encodeURIComponent(token)}/`, { cache: 'no-store' }),
  };
}
