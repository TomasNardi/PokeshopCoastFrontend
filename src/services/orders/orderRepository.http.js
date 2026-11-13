import { CUSTOMER_TOKEN_HEADER } from '../customer/customerRepository.http';

/**
 * Órdenes y pagos contra Django (contrato de Crack).
 *   createOrder(payload) → { order, checkout? }
 *   uploadReceipt(file) → { token, name, content_type, size }
 *   getPaymentConfig() → { card_surcharge_*, shipping_prices, transfer }
 *   verifyPayment({ payment_id, external_reference, ... }) → { status, order }
 *   validateDiscount(code) → { code, percent, fixed, expires_at }
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
  };
}
