import { env } from './env';
import { WHATSAPP_DISPLAY, whatsappUrl } from './whatsapp';

export const SITE = Object.freeze({
  name: 'PokeShop Coast',
  shortName: 'PokeShop',
  tagline: 'Cartas Pokémon TCG con onda de costa',
  description:
    'Tienda de cartas Pokémon TCG en Argentina: singles, slabs certificados, sellados y accesorios. Envíos a todo el país y pago con Mercado Pago.',
  url: env.siteUrl,
  locale: 'es_AR',
});

export const CONTACT = Object.freeze({
  email: env.contactEmail,
  whatsappPhone: env.whatsappPhone,
  whatsappDisplay: WHATSAPP_DISPLAY,
  whatsappUrl: whatsappUrl(),
  instagram: 'https://www.instagram.com/pokeshopcoast/',
  instagramHandle: '@pokeshopcoast',
  tiktok: 'https://www.tiktok.com/@pokeshop.coast',
  tiktokHandle: '@pokeshop.coast',
  location: 'Santa Teresita, La Costa, Buenos Aires',
  locationShort: 'Santa Teresita, La Costa',
  hours: 'Lunes a sábados de 10 a 19 h',
});

/** Punto de retiro en persona: lo usan el checkout, la página de envíos y la orden. */
export const PICKUP_POINT = Object.freeze({
  street: 'Calle 36 y 2',
  city: 'Santa Clara del Mar',
  province: 'Buenos Aires',
  // Coordenadas del mapa: hoy el centro de Santa Clara del Mar. Con el pin exacto (link de
  // Google Maps del punto de retiro) se reemplazan acá y el mapa marca la esquina.
  lat: -37.8359,
  lng: -57.5063,
  zoom: 14,
  mapQuery: 'Santa Clara del Mar, Buenos Aires, Argentina',
});
export const PICKUP_ADDRESS = `${PICKUP_POINT.street}, ${PICKUP_POINT.city} — coordinamos día y horario por WhatsApp`;

export const NAV_LINKS = [
  { label: 'Tienda', href: '/tienda' },
  { label: 'Singles', href: '/tienda?category=singles' },
  { label: 'Slabs', href: '/tienda?category=slabs' },
  { label: 'Sellados', href: '/tienda?category=sellados' },
  { label: 'Envíos', href: '/envios' },
  { label: 'Contacto', href: '/contacto' },
];

export const TOP_BANNER_MESSAGE = 'Envíos a todo el país · Pagá con Mercado Pago en cuotas';

/** Link de WhatsApp con un mensaje puntual (ej. consulta por un pedido). */
export const whatsappLink = (message) => whatsappUrl(message);
