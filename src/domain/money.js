/** Precios en ARS sin decimales, como los manda el backend. */
export function formatPrice(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num == null || Number.isNaN(num)) return '$0';
  return `$${Math.round(num).toLocaleString('es-AR')}`;
}

export const toNumber = (value, fallback = 0) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(num) ? num : fallback;
};
