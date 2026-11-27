/**
 * Estados del pedido para el comprador: etiqueta, tono y en qué paso va.
 * El backend manda `status` = estado público (el de entrega manda una vez pagado).
 */

export const ORDER_STATUS = Object.freeze({
  pending_payment: { label: 'Pendiente de pago', tone: 'amber', step: 0 },
  awaiting_transfer: { label: 'Revisando tu pago', tone: 'amber', step: 0 },
  paid: { label: 'Pagado · preparando', tone: 'green', step: 1 },
  ready_for_pickup: { label: 'Listo para retirar', tone: 'green', step: 2 },
  shipped: { label: 'En camino', tone: 'blue', step: 2 },
  delivered: { label: 'Entregado', tone: 'ink', step: 3 },
  rejected: { label: 'Pago rechazado', tone: 'red', step: -1 },
  cancelled: { label: 'Cancelado', tone: 'red', step: -1 },
  expired: { label: 'Vencido', tone: 'muted', step: -1 },
  refunded: { label: 'Reembolsado', tone: 'muted', step: -1 },
});

export const orderStatus = (status) => ORDER_STATUS[status] || { label: status, tone: 'muted', step: 0 };

/** Pasos del progreso según cómo se entrega. */
export function orderSteps(shippingType) {
  return shippingType === 'pickup'
    ? ['Recibido', 'Pago confirmado', 'Listo para retirar', 'Retirado']
    : ['Recibido', 'Pago confirmado', 'En camino', 'Entregado'];
}

/** Pedidos que todavía están "vivos" (para el resumen de la cuenta). */
export const isActiveOrder = (order) => {
  const { step } = orderStatus(order.status);
  return step >= 0 && step < 3;
};

/** Se cobró (aunque después se haya devuelto): define "Pagado con" vs "Medio de pago". */
export const isPaidOrder = (order) => orderStatus(order.status).step >= 1 || order.status === 'refunded';

export const PAYMENT_LABELS = Object.freeze({ mercadopago: 'Mercado Pago', transfer: 'Transferencia' });

/** "hace 5 min", "hace 3 h", "ayer", "12 nov". */
export function timeAgo(iso, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'recién';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
