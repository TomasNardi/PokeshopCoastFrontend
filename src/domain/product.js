/**
 * View-model del producto: toda la lógica de "qué mostrar" en un solo lugar.
 * Los componentes reciben esto ya resuelto y solo pintan; así ProductCard,
 * el detalle y el carrito no repiten las mismas reglas (y se testean acá).
 */
import { toNumber } from './money';
import { getCondition } from './conditions';
import { attributesOf, finishLabel, isHolofoil, isSpecialFinish, languageOf, traitBadgesOf } from './productTraits';

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

/** single | slab | sealed | accessory — decide textos y qué se muestra en la ficha. */
const KIND_BY_CATEGORY = { singles: 'single', slabs: 'slab', sellados: 'sealed', sellado: 'sealed', accesorios: 'accessory' };

export function productKind(product) {
  const slug = nameOf(product?.category, 'slug');
  if (slug && KIND_BY_CATEGORY[slug]) return KIND_BY_CATEGORY[slug];
  if (certificationLabel(product)) return 'slab';
  if (product?.catalog) return 'single';
  return 'sealed';
}

/** "Este producto está en inglés" (como unsobremas). */
const LANGUAGE_SENTENCE = { en: 'inglés', es: 'castellano', pt: 'portugués', ja: 'japonés', zh: 'chino' };
export function languageSentence(language) {
  if (!language?.code || !LANGUAGE_SENTENCE[language.code]) return '';
  return `Este producto está en ${LANGUAGE_SENTENCE[language.code]}`;
}

/** Garantía que corresponde a cada tipo: un sellado no es "la foto de la carta". */
const TRUST_LINE = {
  single: 'La foto es de la carta que recibís.',
  slab: 'La foto es del slab que recibís: certificación verificable.',
  sealed: 'Producto 100% original y sellado de fábrica.',
  accessory: 'Producto original, nuevo y sin uso.',
};

/** Descripción cuando no se cargó una en el admin: corta, honesta y por tipo. */
export function defaultDescription(kind, { setName } = {}) {
  switch (kind) {
    case 'sealed':
      return [
        `Producto original, nuevo y sellado de fábrica${setName ? ` de la expansión ${setName}` : ''}. Ideal para abrir o para sumar a tu colección.`,
        'Las fotos son de referencia: el diseño del empaque puede variar según la tirada.',
      ];
    case 'accessory':
      return ['Original y nuevo. Cuidá tus cartas con la misma protección que usan los coleccionistas.'];
    case 'slab':
      return [
        'Carta certificada y encapsulada: la nota y el número de certificación se pueden verificar en la web de la certificadora.',
        'La foto es del slab exacto que vas a recibir.',
      ];
    default:
      return [
        `Carta original${setName ? ` de ${setName}` : ''}. La foto es de la carta exacta que vas a recibir y el estado está revisado a mano.`,
        'Se envía protegida con funda y toploader.',
      ];
  }
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
  const kind = productKind(product);
  const language = languageOf(product);

  return {
    id: product.id,
    slug: product.slug,
    href: `/tienda/${product.slug}`,
    name: product.name,
    title: catalog?.name ? `${catalog.name}${catalog.number ? ` ${catalog.number}` : ''}` : product.name,
    subtitle: catalog?.set_name || category || '',
    category,
    categorySlug: nameOf(product.category, 'slug'),
    kind,
    trustLine: TRUST_LINE[kind],
    languageSentence: languageSentence(language),
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
    language,
    finish: finishLabel(product.finish),
    isHolofoil: isHolofoil(product.finish),
    traits: [isSpecialFinish(product.finish) ? finishLabel(product.finish) : null, ...attributesOf(product)].filter(Boolean),
    traitBadges: traitBadgesOf(product),
    maxQuantity: getMaxQuantity(product),
    stockStatus: stockStatusOf(product),
    isAvailable: getMaxQuantity(product) > 0,
    catalog,
    description: product.description || '',
    isOutlet: Boolean(product.is_outlet),
    damageNote: product.damage_note || '',
  };
}
