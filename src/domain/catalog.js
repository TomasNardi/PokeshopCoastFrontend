/** Contrato de filtros de la tienda: mismos query params que /products/ en Django. */

export const PAGE_SIZE = 12;

export const PRODUCT_FILTER_KEYS = [
  'search',
  'category',
  'condition',
  'set',
  'rarity',
  'certification_entity',
  'language',
  'min_price',
  'max_price',
  'in_stock',
  'has_discount',
  'outlet',
  'ordering',
  'page',
];

export const ORDERING_OPTIONS = [
  { value: '', label: 'Destacados' },
  { value: '-created_at', label: 'Más nuevos' },
  { value: 'price_ars', label: 'Menor precio' },
  { value: '-price_ars', label: 'Mayor precio' },
];

export const CATEGORIES = [
  { slug: 'singles', name: 'Singles', blurb: 'Cartas sueltas, todos los estados' },
  { slug: 'slabs', name: 'Slabs', blurb: 'Certificadas PSA · CGC · BGS' },
  { slug: 'sellados', name: 'Sellados', blurb: 'Boosters, ETBs y cajas' },
  { slug: 'accesorios', name: 'Accesorios', blurb: 'Folios, sleeves y toploaders' },
];

/** Filtros de selección múltiple: viajan separados por coma (?rarity=Rare,Holo%20Rare). */
export const MULTI_FILTER_KEYS = ['set', 'rarity', 'condition', 'language'];

export const splitValues = (value) => String(value || '').split(',').map((v) => v.trim()).filter(Boolean);

/** Agrega o saca un valor de un filtro múltiple. Devuelve el string para la URL ('' = sin filtro). */
export function toggleValue(current, value) {
  const values = splitValues(current);
  const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
  return next.join(',');
}

/** Normaliza searchParams (string | string[] | undefined) a un objeto plano y limpio. */
export function normalizeFilters(raw = {}) {
  const out = {};
  for (const key of PRODUCT_FILTER_KEYS) {
    const value = Array.isArray(raw[key]) ? raw[key][0] : raw[key];
    if (value == null || value === '') continue;
    out[key] = String(value).trim();
  }
  const page = Number.parseInt(out.page, 10);
  out.page = Number.isInteger(page) && page > 0 ? page : 1;
  return out;
}
