import { describe, expect, it } from 'vitest';
import { certificationLabel, getMaxQuantity, productView, stockStatusOf } from '@/domain/product';
import { MOCK_PRODUCTS } from '@/mocks/data/products';

const bySlug = (slug) => MOCK_PRODUCTS.find((p) => p.slug === slug);

describe('productView', () => {
  it('parte el título del catálogo en título + set', () => {
    const view = productView(bySlug('charizard-ex-199-151'));
    expect(view.title).toBe('Charizard ex 199/165');
    expect(view.subtitle).toBe('Scarlet & Violet 151');
    expect(view.href).toBe('/tienda/charizard-ex-199-151');
  });

  it('en un slab muestra la nota y NUNCA la condición', () => {
    const view = productView({ ...bySlug('umbreon-vmax-215-evolving-skies-psa-10'), condition: { name: 'Near Mint' } });
    expect(view.certLabel).toBe('PSA 10');
    expect(view.condition).toBeNull();
  });

  it('resuelve la condición con su configuración visual', () => {
    expect(productView(bySlug('blastoise-002-base-set-mp')).condition.abbr).toBe('MP');
  });

  it('calcula precio con descuento y precio tachado', () => {
    const view = productView(bySlug('charizard-004-base-set-lp'));
    expect(view.hasDiscount).toBe(true);
    expect(view.price).toBe(828000);
    expect(view.compareAtPrice).toBe(920000);
  });

  it('sin descuento no hay precio tachado', () => {
    expect(productView(bySlug('charizard-ex-199-151')).compareAtPrice).toBeNull();
  });

  it('lista acabados especiales y particularidades, no los de base', () => {
    expect(productView(bySlug('lugia-009-neo-genesis-1st-edition')).traits).toEqual(['1st Edition Holo', 'Firmada']);
    expect(productView(bySlug('charizard-ex-199-151')).traits).toEqual([]);
  });

  it('resuelve el idioma con bandera', () => {
    expect(productView(bySlug('mew-ex-151-151-jp')).language).toMatchObject({ code: 'ja', flag: '/flags/flag-jp.svg' });
  });

  it('acepta category/condition como string (serializers viejos)', () => {
    const view = productView({ id: 1, slug: 'x', name: 'X', category: 'Singles', condition: 'near mint', price_ars: '100' });
    expect(view.subtitle).toBe('Singles');
    expect(view.condition.label).toBe('Near Mint');
    expect(view.price).toBe(100);
  });
});

describe('stock', () => {
  it.each([
    [{ in_stock: false, stock_quantity: 5 }, 0, 'out'],
    [{ in_stock: true, stock_quantity: 0 }, 0, 'out'],
    [{ in_stock: true, stock_quantity: 2 }, 2, 'low'],
    [{ in_stock: true, stock_quantity: 9 }, 9, 'in'],
    [{ in_stock: true }, Infinity, 'in'],
  ])('%o → max %s, estado %s', (product, max, status) => {
    expect(getMaxQuantity(product)).toBe(max);
    expect(stockStatusOf(product)).toBe(status);
  });
});

describe('certificationLabel', () => {
  it('"9.5" queda igual y acepta objetos', () => {
    expect(certificationLabel({ certification_entity: { abbreviation: 'CGC' }, certification_grade: { grade: '9.5' } })).toBe('CGC 9.5');
  });
  it('sin nota no hay etiqueta', () => {
    expect(certificationLabel({ certification_entity: 'PSA', certification_grade: null })).toBeNull();
  });
});
