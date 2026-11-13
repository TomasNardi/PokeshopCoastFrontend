import { describe, expect, it } from 'vitest';
import { buildWhatsappMessage, formatWhatsappPhone, whatsappUrl } from '@/config/whatsapp';

describe('WhatsApp', () => {
  it('formatea el número para mostrar', () => {
    expect(formatWhatsappPhone('5492257554759')).toBe('+54 9 2257 55-4759');
  });

  it('arma el link de wa.me con el número de PokeShop Coast y el texto codificado', () => {
    const url = whatsappUrl('¡Hola, PokeShop Coast!', '5492257554759');
    expect(url).toBe(`https://wa.me/5492257554759?text=${encodeURIComponent('¡Hola, PokeShop Coast!')}`);
  });

  it('el número por defecto es +54 9 2257 55-4759', () => {
    expect(whatsappUrl()).toMatch(/^https:\/\/wa\.me\/5492257554759\?text=/);
  });

  it('mensaje general arranca con "¡Hola, PokeShop Coast!"', () => {
    expect(buildWhatsappMessage({ pathname: '/' })).toBe('¡Hola, PokeShop Coast! 👋 Quería hacerles una consulta.');
  });

  it('en un producto manda el link de la página', () => {
    const msg = buildWhatsappMessage({ pathname: '/tienda/charizard', pageUrl: 'https://pokeshopcoast.com/tienda/charizard' });
    expect(msg).toContain('Quería consultar por este producto: https://pokeshopcoast.com/tienda/charizard');
  });

  it('en checkout/carrito la consulta es por la compra', () => {
    expect(buildWhatsappMessage({ pathname: '/checkout' })).toContain('consulta sobre mi compra');
    expect(buildWhatsappMessage({ pathname: '/carrito' })).toContain('consulta sobre mi compra');
  });
});
