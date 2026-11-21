/**
 * Reglas del carrito como funciones puras. El store (zustand) solo las
 * orquesta; los totales que muestra el front son informativos: el backend
 * recalcula precio, stock y descuentos al crear la orden.
 */
import { toNumber } from './money';
import { getMaxQuantity } from './product';
import { surchargeOn } from './pricing';

export function clampQuantity(quantity, maxQuantity) {
  const qty = Math.max(0, Math.floor(quantity));
  return Number.isFinite(maxQuantity) ? Math.min(qty, maxQuantity) : qty;
}

/** Lo mínimo que se guarda del producto en el carrito (persistido en localStorage). */
export function toCartLine(product, quantity, previous = {}) {
  const category = product.category && typeof product.category === 'object' ? product.category.name : product.category;
  return {
    ...previous,
    id: product.id,
    slug: product.slug,
    name: product.name,
    image_url: product.image_url || null,
    category: category || null,
    price_ars: product.price_ars,
    final_price: product.final_price ?? product.price_ars,
    discount_percent: product.discount_percent || 0,
    stock_quantity: product.stock_quantity ?? null,
    in_stock: product.in_stock !== false,
    quantity: clampQuantity(quantity, getMaxQuantity(product)),
  };
}

/**
 * Suma `qty` al carrito respetando stock. Devuelve { items, added } sin mutar.
 * `added` es false si no entró ninguna unidad (sin stock o ya en el tope).
 */
export function addLine(items, product, qty = 1) {
  const max = getMaxQuantity(product);
  if (max === 0 || qty <= 0) return { items, added: false };

  const existing = items.find((item) => item.id === product.id);
  if (!existing) {
    return { items: [...items, toCartLine(product, qty)], added: true };
  }
  const next = clampQuantity(existing.quantity + qty, max);
  if (next === existing.quantity) return { items, added: false };
  return {
    items: items.map((item) => (item.id === product.id ? toCartLine(product, next, item) : item)),
    added: true,
  };
}

export function setLineQuantity(items, productId, quantity) {
  if (quantity <= 0) return items.filter((item) => item.id !== productId);
  return items.map((item) =>
    item.id === productId ? { ...item, quantity: clampQuantity(quantity, getMaxQuantity(item)) } : item
  );
}

/** Refresca precios/stock con lo que devolvió el backend. Lo que ya no existe queda sin stock. */
export function syncLines(items, freshProducts) {
  const byId = new Map(freshProducts.map((p) => [p.id, p]));
  return items.map((item) => {
    const fresh = byId.get(item.id);
    if (!fresh) return { ...item, in_stock: false, stock_quantity: 0 };
    return toCartLine(fresh, item.quantity, item);
  });
}

export const itemCount = (items) => items.reduce((n, item) => n + item.quantity, 0);

export const subtotalOf = (items) =>
  items.reduce((sum, item) => sum + toNumber(item.final_price ?? item.price_ars) * item.quantity, 0);

/**
 * Totales del checkout. Misma regla que Crack y que el backend:
 * el recargo de Mercado Pago va solo sobre los productos (después del
 * cupón), nunca sobre el envío. Ver domain/pricing.js.
 *
 * @param {object} p
 * @param {number} p.subtotal
 * @param {number} [p.discountPercent]
 * @param {number} [p.discountFixed]
 * @param {number|null} [p.shipping]  null = "a cotizar"
 * @param {number} [p.surchargePercent]      recargo del medio ELEGIDO (0 en transferencia)
 * @param {number} [p.cardSurchargePercent]  recargo de MP según el backoffice, para comparar
 *                                           los dos medios ("Ahorrás $X", total del otro medio)
 */
export function computeTotals({ subtotal, discountPercent = 0, discountFixed = 0, shipping = 0, surchargePercent = 0, cardSurchargePercent = surchargePercent }) {
  const discount = Math.min(subtotal, subtotal * (discountPercent / 100) + discountFixed);
  const afterDiscount = subtotal - discount;
  const shippingCost = shipping == null ? 0 : shipping;
  const surcharge = surchargeOn(afterDiscount, surchargePercent);
  const cardSurcharge = surchargeOn(afterDiscount, cardSurchargePercent);
  const transferTotal = Math.max(0, afterDiscount + shippingCost);
  return {
    subtotal,
    discount,
    shipping,
    surcharge,
    surchargePercent,
    total: Math.max(0, afterDiscount + shippingCost + surcharge),
    // Para comparar los dos medios, elija el que elija.
    cardSurcharge,
    cardSurchargePercent,
    transferTotal,
    cardTotal: transferTotal + cardSurcharge,
  };
}
