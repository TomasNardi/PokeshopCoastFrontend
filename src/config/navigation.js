/**
 * Menú principal (estructura del megamenú, estilo tema Broadcast).
 *
 * Cada item con `links` + `blocks` abre un megamenú a todo el ancho:
 *   - links:  columna izquierda (aparecen en cascada)
 *   - blocks: hasta 3 imágenes cuadradas con título. La imagen sale del
 *             catálogo (`from` filtra productos, `pick` elige cuál) para que
 *             el menú se actualice solo cuando cambia el stock.
 * Un item sin `links` es un link simple.
 */
export const MAIN_MENU = [
  {
    id: 'singles',
    label: 'Singles',
    href: '/tienda?category=singles',
    links: [
      { label: 'Near Mint', href: '/tienda?category=singles&condition=Near%20Mint' },
      { label: 'Mint', href: '/tienda?category=singles&condition=Mint' },
      { label: 'Lightly Played', href: '/tienda?category=singles&condition=Lightly%20Played' },
      { label: 'Moderately Played', href: '/tienda?category=singles&condition=Moderately%20Played' },
      { label: 'Japonés', href: '/tienda?category=singles&language=ja' },
      { label: 'En oferta', href: '/tienda?category=singles&has_discount=true' },
      { label: 'Todo', href: '/tienda?category=singles' },
    ],
    blocks: [
      { title: 'Todo', href: '/tienda?category=singles', from: { category: 'singles' }, pick: 0 },
      { title: 'New', href: '/tienda?category=singles&ordering=-created_at', from: { category: 'singles' }, pick: 1 },
      { title: 'Ofertas', href: '/tienda?category=singles&has_discount=true', from: { category: 'singles', discount: true }, pick: 0 },
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
      { title: 'PSA', href: '/tienda?category=slabs&certification_entity=PSA', from: { category: 'slabs' }, pick: 0 },
      { title: 'CGC', href: '/tienda?category=slabs&certification_entity=CGC', from: { category: 'slabs' }, pick: 1 },
      { title: 'Todo', href: '/tienda?category=slabs', from: { category: 'slabs' }, pick: 2 },
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
      { label: 'Todo', href: '/tienda?category=sellados' },
    ],
    blocks: [
      { title: 'Todo', href: '/tienda?category=sellados', from: { category: 'sellados' }, pick: 0 },
      { title: 'New', href: '/tienda?category=sellados&ordering=-created_at', from: { category: 'sellados' }, pick: 1 },
      { title: 'Best sellers', href: '/tienda?category=sellados', from: { featured: true }, pick: 0 },
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
      { title: 'Todo', href: '/tienda?category=accesorios', from: { category: 'accesorios' }, pick: 0 },
      { title: 'New', href: '/tienda?ordering=-created_at', from: {}, pick: 0 },
      { title: 'Envíos', href: '/envios', from: { featured: true }, pick: 1 },
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
