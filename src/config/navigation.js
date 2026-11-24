/**
 * Menú principal (estructura del megamenú, estilo tema Broadcast).
 *
 * Cada item con `links` + `blocks` abre un megamenú a todo el ancho:
 *   - links:  columna izquierda (aparecen en cascada)
 *   - blocks: hasta 3 imágenes cuadradas con título. La imagen es el primer
 *             producto con stock (y foto) que devuelve `query` en la tienda;
 *             si no hay ninguno, prueba `fallback`. Así el menú se actualiza
 *             solo cuando cambia el stock. Las elegidas las pidió el dueño.
 * Un item sin `links` es un link simple.
 */
export const MAIN_MENU = [
  {
    id: 'singles',
    label: 'Singles',
    href: '/tienda?category=singles',
    links: [
      { label: 'Near Mint', href: '/tienda?category=singles&condition=NM' },
      { label: 'Mint', href: '/tienda?category=singles&condition=MT' },
      { label: 'Lightly Played', href: '/tienda?category=singles&condition=LP' },
      { label: 'Moderately Played', href: '/tienda?category=singles&condition=MP' },
      { label: 'Japonés', href: '/tienda?category=singles&language=ja' },
      { label: 'Chino', href: '/tienda?category=singles&language=zh' },
      { label: 'En oferta', href: '/tienda?category=singles&has_discount=true' },
      { label: 'Todo', href: '/tienda?category=singles' },
    ],
    blocks: [
      // El Charizard de Base Set que haya (el más caro); si no hay, el último single cargado.
      {
        title: 'Todo',
        href: '/tienda?category=singles',
        query: { category: 'singles', set: 'base-set-en', search: 'charizard', ordering: '-final_price' },
        fallback: { category: 'singles', ordering: '-created_at' },
      },
      { title: 'New', href: '/tienda?category=singles&ordering=-created_at', query: { category: 'singles', ordering: '-final_price' } },
      {
        title: 'Ofertas',
        href: '/tienda?category=singles&has_discount=true',
        query: { category: 'singles', has_discount: 'true', ordering: '-final_price' },
      },
    ],
  },
  {
    id: 'slabs',
    label: 'Slabs',
    href: '/tienda?category=slabs',
    links: [
      { label: 'PSA', href: '/tienda?category=slabs&certification_entity=PSA' },
      { label: 'CGC', href: '/tienda?category=slabs&certification_entity=CGC' },
      { label: 'BGS', href: '/tienda?category=slabs&certification_entity=BGS' },
      { label: 'Todo', href: '/tienda?category=slabs' },
    ],
    blocks: [
      {
        title: 'PSA',
        href: '/tienda?category=slabs&certification_entity=PSA',
        query: { category: 'slabs', certification_entity: 'PSA', ordering: '-final_price' },
      },
      {
        title: 'CGC',
        href: '/tienda?category=slabs&certification_entity=CGC',
        query: { category: 'slabs', certification_entity: 'CGC', ordering: '-final_price' },
      },
      { title: 'Todo', href: '/tienda?category=slabs', query: { category: 'slabs', ordering: '-created_at' } },
    ],
  },
  {
    id: 'sellado',
    label: 'Sellado',
    href: '/tienda?category=sellados',
    links: [
      { label: 'Booster boxes', href: '/tienda?category=sellados&search=booster' },
      { label: 'Elite trainer boxes', href: '/tienda?category=sellados&search=elite' },
      { label: 'Japonés', href: '/tienda?category=sellados&language=ja' },
      { label: 'Chino', href: '/tienda?category=sellados&language=zh' },
      { label: 'Todo', href: '/tienda?category=sellados' },
    ],
    blocks: [
      { title: 'Todo', href: '/tienda?category=sellados', query: { category: 'sellados', ordering: '-final_price' } },
      { title: 'New', href: '/tienda?category=sellados&ordering=-created_at', query: { category: 'sellados', ordering: '-created_at' } },
      // Lo más vendido; sin ventas, uno al azar (lo resuelve el backend).
      { title: 'Best sellers', href: '/tienda?category=sellados', query: { category: 'sellados', ordering: 'best_selling' } },
    ],
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    href: '/tienda?category=accesorios',
    links: [
      { label: 'Sleeves', href: '/tienda?category=accesorios&search=sleeves' },
      { label: 'Toploaders', href: '/tienda?category=accesorios&search=toploader' },
      { label: 'Carpetas', href: '/tienda?category=accesorios&search=carpeta' },
      { label: 'Todo', href: '/tienda?category=accesorios' },
    ],
    blocks: [
      { title: 'Todo', href: '/tienda?category=accesorios', query: { category: 'accesorios' } },
      {
        title: 'Toploaders',
        href: '/tienda?category=accesorios&search=toploader',
        query: { category: 'accesorios', search: 'toploader' },
        fallback: { category: 'accesorios' },
      },
      {
        title: 'Carpetas',
        href: '/tienda?category=accesorios&search=carpeta',
        query: { category: 'accesorios', search: 'carpeta' },
        fallback: { category: 'accesorios' },
      },
    ],
  },
  // Destacado en rojo (como el --highlight del tema).
  { id: 'outlet', label: 'Outlet', href: '/outlet', highlight: true },
  // Contacto no va en el menú: está en el footer y el botón de WhatsApp.
];

/** Accesos de la búsqueda (columna "Populares"). */
export const POPULAR_SEARCH_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Catálogo completo', href: '/tienda' },
  { label: 'Slabs certificados', href: '/tienda?category=slabs' },
  { label: 'Ofertas', href: '/tienda?has_discount=true' },
];
