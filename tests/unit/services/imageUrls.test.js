import { describe, expect, it } from 'vitest';
import { localizeImages, localizeImageUrl } from '@/services/catalog/imageUrls';

const ORIGIN = 'http://localhost:3000';

describe('imágenes del backend', () => {
  it('las del propio front pasan a ruta relativa', () => {
    expect(localizeImageUrl('http://localhost:3000/products/etb.webp', ORIGIN)).toBe('/products/etb.webp');
  });

  it('las remotas no se tocan', () => {
    const url = 'https://images.pokemontcg.io/base1/4_hires.png';
    expect(localizeImageUrl(url, ORIGIN)).toBe(url);
    expect(localizeImageUrl('http://localhost:30000/x.webp', ORIGIN)).toBe('http://localhost:30000/x.webp');
  });

  it('respuestas paginadas, listas y galería', () => {
    const product = { image_url: `${ORIGIN}/a.webp`, image_url_thumb: `${ORIGIN}/a.webp`, images: [`${ORIGIN}/b.webp`, { url: `${ORIGIN}/c.webp` }] };
    const [p] = localizeImages({ count: 1, results: [product] }, ORIGIN).results;
    expect(p.image_url).toBe('/a.webp');
    expect(p.images).toEqual(['/b.webp', { url: '/c.webp' }]);
    expect(localizeImages([product], ORIGIN)[0].image_url_thumb).toBe('/a.webp');
  });
});
