/**
 * Resuelve las imágenes de los bloques del megamenú a partir de la tienda.
 * Sin React: lo llama el layout en el servidor y se testea aparte.
 */

// Se piden unos pocos por bloque para poder saltear los que no tienen foto
// o ya se usaron en otro bloque del mismo megamenú.
const PICK_POOL = 6;

async function pick(listProducts, query, used) {
  if (!query) return null;
  let results = [];
  try {
    results = (await listProducts({ ...query, in_stock: 'true', page_size: PICK_POOL }))?.results || [];
  } catch {
    return null; // decorativo: si falla, el bloque queda sin foto pero el sitio anda
  }
  const withImage = results.filter((p) => p?.image_url);
  return withImage.find((p) => !used.has(p.id)) || withImage[0] || null;
}

/**
 * @param {Array} menu MAIN_MENU (cada bloque con `query` y, opcional, `fallback`)
 * @param {(filters: object) => Promise<{results: Array}>} listProducts la búsqueda de la tienda
 * @returns menú con `blocks[i].image` resuelto (o null si no hay producto)
 */
export async function loadMenuImages(menu, listProducts) {
  return Promise.all(
    menu.map(async (item) => {
      if (!item.blocks) return item;
      const used = new Set();
      const blocks = [];
      // En orden: el primer bloque elige primero y los siguientes no repiten su foto.
      for (const block of item.blocks) {
        const product = (await pick(listProducts, block.query, used)) || (await pick(listProducts, block.fallback, used));
        if (product) used.add(product.id);
        blocks.push({ title: block.title, href: block.href, image: product?.image_url || null, alt: product?.name || block.title });
      }
      return { ...item, blocks };
    })
  );
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
