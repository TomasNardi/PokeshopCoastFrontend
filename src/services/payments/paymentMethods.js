/**
 * Medios de pago — patrón Strategy.
 *
 * El backend crea la orden y, para Mercado Pago, la preferencia de Checkout
 * Pro (respuesta { order, checkout: { init_point } }), igual que en Crack.
 * Cada estrategia decide el paso siguiente a partir de esa respuesta:
 *   { type: 'redirect', url }  → salir del sitio (MP)
 *   { type: 'route', href }    → navegar dentro del sitio
 *
 * Las back_urls de MP las arma el backend con `frontend_origin`:
 *   /checkout/confirmacion · /checkout/pendiente · /checkout/error
 */

export const MERCADOPAGO = {
  id: 'mercadopago',
  label: 'Mercado Pago',
  description: 'Tarjeta de crédito o débito, cuotas o dinero en cuenta.',
  requiresReceipt: false,
  surchargePercent: (config) => (config?.card_surcharge_enabled ? Number(config.card_surcharge_percent) || 0 : 0),
  nextStep(response) {
    const url = response?.checkout?.init_point || response?.checkout?.sandbox_init_point;
    if (!url) throw new Error('No recibimos el link de pago de Mercado Pago. Volvé a intentar.');
    return { type: 'redirect', url };
  },
};

export const TRANSFER = {
  id: 'transfer',
  label: 'Transferencia bancaria',
  description: 'Sin recargo. Adjuntás el comprobante y confirmamos a mano.',
  requiresReceipt: true,
  surchargePercent: () => 0,
  nextStep(response) {
    const order = response?.order || response;
    const qs = new URLSearchParams({ order: String(order.id), code: order.order_code, transfer: '1' });
    return { type: 'route', href: `/checkout/confirmacion?${qs}` };
  },
};

export const PAYMENT_METHODS = Object.freeze({ [MERCADOPAGO.id]: MERCADOPAGO, [TRANSFER.id]: TRANSFER });
export const PAYMENT_METHOD_LIST = Object.values(PAYMENT_METHODS);
export const getPaymentMethod = (id) => PAYMENT_METHODS[id] || null;

/** Estados que MP manda en la back_url (?status=...) → a qué página va el comprador. */
export function routeForMercadoPagoStatus(status) {
  if (status === 'approved') return '/checkout/confirmacion';
  if (status === 'pending' || status === 'in_process') return '/checkout/pendiente';
  return '/checkout/error';
}
