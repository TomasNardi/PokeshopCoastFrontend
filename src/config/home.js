/**
 * Contenido editable del home. Para cambiar la imagen de fondo del hero
 * alcanza con reemplazar los archivos de /public/hero (o apuntar a una URL
 * de Cloudinary): desktop ~2400×900 (2.67:1), mobile ~1200×1213.
 */
export const HOME_HEROES = {
  main: {
    subtitle: 'Desde la costa, llevando Pokémon TCG a todo el país.',
    title: 'PokeShop Coast',
    // El logo va arriba del subtítulo; mientras el hero se ve, el header no lo repite.
    logo: '/brand/pokeshop-logo.png',
    cta: { label: 'Comprar', href: '/tienda' },
    // Fondo: collage de cartas Base Set (elegido en Figma), con el mismo look
    // del banner de Figma: negro a la izquierda y la imagen fundiéndose desde
    // la derecha ('split'; en mobile la imagen arriba y se funde hacia abajo).
    // Charizard + Ancient Mew, upscale Real-ESRGAN x4 → 2560×1440.
    // Anteriores: /hero/pokemon-original-2016.avif, /hero/banner-pc.webp + /hero/banner-mobile.webp.
    layout: 'split',
    image: { desktop: '/hero/pokemon-top-cards.webp', alt: '', focal: '50% 50%', focalMobile: '38% 50%' },
  },
  secondary: {
    subtitle: 'Certificadas PSA · CGC · BGS',
    title: 'Slabs',
    cta: { label: 'Ver slabs', href: '/tienda?category=slabs' },
    // Fondo: 3 slabs PSA con el Charizard adelante (Figma "Banner 2 PSA", export 2x).
    // La izquierda queda oscura para el texto; en mobile se encuadra sobre las cartas.
    // Anterior: /hero/coast-hero-night.svg + /hero/coast-hero-night-mobile.svg.
    layout: 'stage',
    image: { desktop: '/hero/slabs-psa.webp', alt: '', focal: '88% 50%', focalMobile: '58% 50%' },
  },
};
