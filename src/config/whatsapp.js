import { env } from './env';

/**
 * WhatsApp de atención: número, formato para mostrar y mensajes prearmados.
 * El número va en formato internacional sin "+" (wa.me lo exige así):
 * 54 (Argentina) · 9 (celular) · 2257 (característica) · 554759.
 */
export const WHATSAPP_PHONE = env.whatsappPhone;

/** "5492257554759" → "+54 9 2257 55-4759" (característica de 4 dígitos). */
export function formatWhatsappPhone(phone = WHATSAPP_PHONE) {
  const digits = String(phone).replace(/\D/g, '');
  const match = digits.match(/^54(9)(\d{4})(\d{2})(\d{4})$/);
  if (!match) return `+${digits}`;
  const [, mobile, area, first, last] = match;
  return `+54 ${mobile} ${area} ${first}-${last}`;
}

export const WHATSAPP_DISPLAY = formatWhatsappPhone();

const GREETING = '¡Hola, PokeShop Coast! 👋';

/**
 * Mensaje según dónde está el cliente: en un producto manda el link para que
 * no haya que preguntar "¿cuál?"; en el checkout o la cuenta, la consulta es
 * por la compra. El resto, consulta general.
 */
export function buildWhatsappMessage({ pathname = '/', pageUrl = '' } = {}) {
  if (pathname.startsWith('/tienda/') && pageUrl) {
    return `${GREETING} Quería consultar por este producto: ${pageUrl}`;
  }
  if (pathname.startsWith('/checkout') || pathname.startsWith('/carrito')) {
    return `${GREETING} Tengo una consulta sobre mi compra.`;
  }
  if (pathname.startsWith('/cuenta')) {
    return `${GREETING} Tengo una consulta sobre mi pedido.`;
  }
  return `${GREETING} Quería hacerles una consulta.`;
}

export function whatsappUrl(message = buildWhatsappMessage(), phone = WHATSAPP_PHONE) {
  return `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
