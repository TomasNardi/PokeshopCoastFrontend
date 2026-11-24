/**
 * Qué variantes de /tienda se indexan.
 *
 * Los filtros combinables (rareza × idioma × precio × orden…) generan miles de
 * URLs casi iguales: si Google las indexa, reparte la autoridad entre todas y
 * gasta el rastreo en duplicados. Regla:
 *   - /tienda, /tienda?category=x y su paginación (?page=n) → indexables, canonical propio.
 *   - cualquier otro filtro o búsqueda → noindex, follow (Google sigue los links
 *     a los productos, pero no guarda esa lista).
 */
const INDEXABLE_KEYS = new Set(['category', 'page']);

export function shopIndexing(filters = {}) {
  const extra = Object.entries(filters).some(([key, value]) => !INDEXABLE_KEYS.has(key) && value != null && value !== '');
  const qs = new URLSearchParams();
  if (filters.category) qs.set('category', filters.category);
  if (Number(filters.page) > 1) qs.set('page', String(filters.page));
  const query = qs.toString();
  return { canonical: `/tienda${query ? `?${query}` : ''}`, indexable: !extra };
}

/** Solo se manda robots cuando es noindex: un index explícito pisaría el noindex del layout antes de la apertura. */
export const NOINDEX_FOLLOW = Object.freeze({ index: false, follow: true });
