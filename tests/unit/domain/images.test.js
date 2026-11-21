import { describe, expect, it } from 'vitest';
import { imageRenditions, thumbOf } from '@/domain/images';

const R2 = 'https://pub-abc.r2.dev';

describe('versiones de las fotos del bucket', () => {
  it('foto subida: 320 / 800 / 1400', () => {
    const r = imageRenditions(`${R2}/tcg/pkm/pokeshop/products/2026/11/abc.webp`);
    expect(r.thumb).toBe(`${R2}/tcg/pkm/pokeshop/products/2026/11/abc_thumb.webp`);
    expect(r.srcSet).toContain('abc_medium.webp 800w');
    expect(r.srcSet).toContain('abc.webp 1400w');
  });

  it('catálogo y sin fondo: 200 / 600 / 660', () => {
    expect(imageRenditions(`${R2}/tcg/pkm/singles/d8.webp`).srcSet).toContain('d8_thumb.webp 200w');
    expect(imageRenditions(`${R2}/tcg/pkm/pokeshop/sin-fondo/x.webp`).srcSet).toContain('x.webp 660w');
  });

  it('URL externa, de mocks o que ya es una versión: se usa tal cual', () => {
    expect(imageRenditions('https://images.pokemontcg.io/sv3pt5/199_hires.png')).toBeNull();
    expect(imageRenditions(`${R2}/tcg/pkm/singles/d8_thumb.webp`)).toBeNull();
    expect(thumbOf('/mock/charizard.webp')).toBe('/mock/charizard.webp');
  });
});
