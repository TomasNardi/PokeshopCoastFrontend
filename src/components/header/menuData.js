/**
 * Resuelve las imágenes de los bloques del megamenú a partir del catálogo.
 * Puro (sin React): lo llama el layout en el servidor y se testea aparte.
 */

const categorySlug = (product) =>
  product?.category && typeof product.category === 'object' ? product.category.slug : product?.category;

function matches(product, from = {}) {
  if (!product?.image_url) return false;
  if (from.category && categorySlug(product) !== from.category) return false;
  if (from.discount && !(Number(product.discount_percent) > 0)) return false;
  if (from.featured && !product.is_featured) return false;
  return true;
}

/**
 * @param {Array} menu   MAIN_MENU
 * @param {Array} products productos disponibles (featured + nuevos, sin repetir)
 * @returns menú con `blocks[i].image` resuelto (o null si no hay producto)
 */
export function resolveMenuImages(menu, products) {
  const unique = [...new Map(products.filter(Boolean).map((p) => [p.id, p])).values()];
  return menu.map((item) => {
    if (!item.blocks) return item;
    return {
      ...item,
      blocks: item.blocks.map((block) => {
        const pool = unique.filter((p) => matches(p, block.from));
        const fallback = unique.filter((p) => p.image_url);
        const source = pool.length ? pool : fallback;
        const product = source.length ? source[(block.pick || 0) % source.length] : null;
        return { title: block.title, href: block.href, image: product?.image_url || null, alt: product?.name || block.title };
      }),
    };
  });
}

/**
 * Retrasos en cascada idénticos al tema Broadcast (theme.js → staggerChildAnimations):
 * links: i * e + 10 ms, con e = 50 que se multiplica por 0.95 en cada paso.
 */
export function linkStaggerDelays(count) {
  let step = 50;
  return Array.from({ length: count }, (_, i) => {
    const delay = i * step + 10;
    step *= 0.95;
    return delay;
  });
}

/** Imágenes: 100 ms entre una y otra ([data-stagger-first]). */
export const imageStaggerDelay = (index) => index * 100;
