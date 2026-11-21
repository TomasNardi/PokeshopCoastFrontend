/**
 * Precio por medio de pago — la misma regla que Crack y que el backend
 * (apps/orders/services/checkout.py):
 *
 *   - El precio publicado es el precio por TRANSFERENCIA.
 *   - Con Mercado Pago / tarjeta se suma el recargo que el dueño configura en
 *     el backoffice (Configuración → Medios de pago), solo si está activo.
 *   - El recargo va SOLO sobre los productos (después del cupón), nunca sobre
 *     el envío.
 *
 * Los montos se redondean a pesos enteros, igual que la orden del backend.
 */

/** % de recargo vigente para Mercado Pago según la config del backoffice (0 si está apagado). */
export function cardSurchargePercent(config) {
  if (!config?.card_surcharge_enabled) return 0;
  const percent = Number(config.card_surcharge_percent);
  return Number.isFinite(percent) && percent > 0 ? percent : 0;
}

/** Recargo en pesos sobre un monto de productos. */
export function surchargeOn(amount, percent) {
  if (!percent || !amount) return 0;
  return Math.round(Number(amount) * (percent / 100));
}

/**
 * Precio de un producto con Mercado Pago / tarjeta, o null si no hay recargo
 * (en ese caso los dos medios cuestan lo mismo y no se muestra la diferencia).
 */
export function cardPriceOf(transferPrice, config) {
  const percent = cardSurchargePercent(config);
  const price = Number(transferPrice);
  if (!percent || !Number.isFinite(price) || price <= 0) return null;
  return price + surchargeOn(price, percent);
}

/** Medios de pago que el dueño dejó activos en el backoffice (sin config: todos). */
export function isPaymentEnabled(id, config) {
  if (!config) return true;
  if (id === 'mercadopago') return config.mercadopago_enabled !== false;
  if (id === 'transfer') return config.transfer_enabled !== false;
  return true;
}
