/**
 * View-model del producto: toda la lógica de "qué mostrar" en un solo lugar.
 * Los componentes reciben esto ya resuelto y solo pintan; así ProductCard,
 * el detalle y el carrito no repiten las mismas reglas (y se testean acá).
 */
import { toNumber } from './money';
import { getCondition } from './conditions';
import { attributesOf, finishLabel, isSpecialFinish, languageOf } from './productTraits';

export const LOW_STOCK_THRESHOLD = 2;

/** Categorías que son cartas (singles y slabs): llevan el tilt 3D. */
const CARD_CATEGORIES = ['singles', 'slabs'];

const nameOf = (value, key = 'name') =>
  value && typeof value === 'object' ? value[key] ?? null : value ?? null;

/** Tope de unidades que se pueden comprar. Infinity si el backend no informa stock. */
export function getMaxQuantity(product) {
  if (!product || product.in_stock === false) return 0;
  if (Number.isInteger(product.stock_quantity)) return Math.max(0, product.stock_quantity);
  return Number.POSITIVE_INFINITY;
}

/** 'in' | 'low' | 'out' — los mismos estados de stock que Crack. */
export function stockStatusOf(product) {
  const max = getMaxQuantity(product);
  if (max === 0) return 'out';
  if (Number.isFinite(max) && max <= LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

/** "PSA 10" a partir de entidad + nota. "10.0" se lee como "10"; "9.5" queda igual. */
export function certificationLabel(product) {
  const entity =
    product?.certification_entity && typeof product.certification_entity === 'object'
      ? product.certification_entity.abbreviation || product.certification_entity.name
      : product?.certification_entity;
  const rawGrade = nameOf(product?.certification_grade, 'grade');
  if (!entity || rawGrade == null || rawGrade === '') return null;
  return `${entity} ${String(rawGrade).replace(/\.0$/, '')}`;
}

export function productView(product) {
  const category = nameOf(product.category);
  const conditionName = nameOf(product.condition);
  const catalog = product.catalog || null;
  const discountPercent = toNumber(product.discount_percent);
  const hasDiscount = discountPercent > 0;
  const listPrice = toNumber(product.price_ars);
  const price = toNumber(product.final_price, listPrice);
  const certLabel = certificationLabel(product);

  return {
    id: product.id,
    slug: product.slug,
    href: `/tienda/${product.slug}`,
    name: product.name,
    title: catalog?.name ? `${catalog.name}${catalog.number ? ` ${catalog.number}` : ''}` : product.name,
    subtitle: catalog?.set_name || category || '',
    category,
    // Carta vs sellado/accesorio: decide el efecto de hover del escenario.
    isCard: nameOf(product.category, 'slug')
      ? CARD_CATEGORIES.includes(nameOf(product.category, 'slug'))
      : Boolean(catalog || certLabel),
    imageUrl: product.image_url || null,
    // Galería: la principal primero y después las extra, sin repetidas.
    images: [...new Set([product.image_url, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean))],
    price,
    compareAtPrice: hasDiscount ? listPrice : null,
    discountPercent: hasDiscount ? discountPercent : 0,
    hasDiscount,
    certLabel,
    // Slab: manda la nota certificada; nunca se muestran condición y nota juntas.
    condition: certLabel ? null : conditionName ? getCondition(conditionName) : null,
    language: languageOf(product),
    finish: finishLabel(product.finish),
    traits: [isSpecialFinish(product.finish) ? finishLabel(product.finish) : null, ...attributesOf(product)].filter(Boolean),
    maxQuantity: getMaxQuantity(product),
    stockStatus: stockStatusOf(product),
    isAvailable: getMaxQuantity(product) > 0,
    catalog,
    description: product.description || '',
    isOutlet: Boolean(product.is_outlet),
    damageNote: product.damage_note || '',
  };
}
