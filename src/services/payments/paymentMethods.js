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

import { cardSurchargePercent, isPaymentEnabled } from '@/domain/pricing';

export const MERCADOPAGO = {
  id: 'mercadopago',
  label: 'Mercado Pago',
  description: 'Crédito, débito y saldo en cuenta. Pago online inmediato.',
  requiresReceipt: false,
  surchargePercent: (config) => cardSurchargePercent(config),
  nextStep(response) {
    const url = response?.checkout?.init_point || response?.checkout?.sandbox_init_point;
    if (!url) throw new Error('No recibimos el link de pago de Mercado Pago. Volvé a intentar.');
    return { type: 'redirect', url };
  },
};

export const TRANSFER = {
  id: 'transfer',
  label: 'Transferencia bancaria',
  description: 'Desde tu home banking o billetera virtual. Adjuntás el comprobante y lo confirmamos.',
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
/** Los medios que el dueño dejó activos en el backoffice. */
export const enabledPaymentMethods = (config) => PAYMENT_METHOD_LIST.filter((m) => isPaymentEnabled(m.id, config));

/** Estados que MP manda en la back_url (?status=...) → a qué página va el comprador. */
export function routeForMercadoPagoStatus(status) {
  if (status === 'approved') return '/checkout/confirmacion';
  if (status === 'pending' || status === 'in_process') return '/checkout/pendiente';
  return '/checkout/error';
}
