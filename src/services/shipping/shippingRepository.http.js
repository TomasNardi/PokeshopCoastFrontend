import { toQuery } from '../http/httpClient';

/**
 * Envíos contra Django (apps/shipping).
 *   quote({ items, zip, province, city, street, number }) → { options: [...] }
 *   branches(carrier, zip) → [{ code, name, address, city, distance_km }]
 */
export function createHttpShippingRepository(http) {
  return {
    quote: ({ items, zip, province, city, street = '', number = '' }, { signal } = {}) =>
      http.post('/shipping/quote/', {
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        zip, province, city, street, number,
      }, { signal, cache: 'no-store' }),
    branches: async (carrier, zip) => (await http.get(`/shipping/branches/${toQuery({ carrier, zip })}`, { cache: 'no-store' }))?.branches || [],
  };
}
