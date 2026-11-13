/**
 * Contenido editable del home. Para cambiar la imagen de fondo del hero
 * alcanza con reemplazar los archivos de /public/hero (o apuntar a una URL
 * de Cloudinary): desktop ~2400×900 (2.67:1), mobile ~1200×1213.
 */
export const HOME_HEROES = {
  main: {
    subtitle: 'Tu tienda favorita de Pokémon TCG en Argentina',
    title: 'PokeShop Coast',
    cta: { label: 'Comprar', href: '/tienda' },
    // Fondo: collage de cartas Base Set (elegido en Figma), con el mismo look
    // del banner de Figma: negro a la izquierda y la imagen fundiéndose desde
    // la derecha ('split'; en mobile la imagen arriba y se funde hacia abajo).
    // Anteriores: /hero/banner-pc.webp + /hero/banner-mobile.webp.
    layout: 'split',
    image: { desktop: '/hero/pokemon-original-2016.avif', alt: '', focal: '50% 50%', focalMobile: '60% 50%' },
  },
  secondary: {
    subtitle: 'Certificadas PSA · CGC · BGS',
    title: 'Slabs',
    cta: { label: 'Ver slabs', href: '/tienda?category=slabs' },
    image: { desktop: '/hero/coast-hero-night.svg', mobile: '/hero/coast-hero-night-mobile.svg', alt: '' },
  },
};
