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
  location: 'Costa Atlántica, Buenos Aires, Argentina',
  hours: 'Lunes a sábados de 10 a 19 h',
});

/** Dirección del punto de retiro: la usa el checkout y la página de envíos. */
export const PICKUP_ADDRESS = 'Punto de retiro PokeShop Coast — coordinamos por WhatsApp';

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
