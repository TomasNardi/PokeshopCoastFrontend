import { describe, expect, it } from 'vitest';
import { addLine, computeTotals, itemCount, setLineQuantity, subtotalOf, syncLines } from '@/domain/cart';

const product = (over = {}) => ({ id: 1, slug: 'p', name: 'P', price_ars: '1000', final_price: '1000', in_stock: true, stock_quantity: 3, ...over });

describe('addLine', () => {
  it('agrega una línea nueva', () => {
    const { items, added } = addLine([], product());
    expect(added).toBe(true);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it('no supera el stock', () => {
    let state = addLine([], product(), 2).items;
    const result = addLine(state, product(), 5);
    expect(result.items[0].quantity).toBe(3);
    state = result.items;
    expect(addLine(state, product()).added).toBe(false);
  });

  it('rechaza productos sin stock', () => {
    expect(addLine([], product({ in_stock: false })).added).toBe(false);
  });

  it('no muta el array original', () => {
    const original = [];
    addLine(original, product());
    expect(original).toEqual([]);
  });
});

describe('setLineQuantity / syncLines', () => {
  it('cantidad 0 quita la línea', () => {
    const items = addLine([], product()).items;
    expect(setLineQuantity(items, 1, 0)).toEqual([]);
  });

  it('sync marca sin stock lo que el backend ya no devuelve y actualiza precios', () => {
    const items = [...addLine([], product()).items, ...addLine([], product({ id: 2 })).items];
    const synced = syncLines(items, [product({ final_price: '800' })]);
    expect(synced[0].final_price).toBe('800');
    expect(synced[1]).toMatchObject({ in_stock: false, stock_quantity: 0 });
  });
});

describe('totales', () => {
  it('suma subtotal y unidades', () => {
    const items = addLine([], product(), 2).items;
    expect(subtotalOf(items)).toBe(2000);
    expect(itemCount(items)).toBe(2);
  });

  it('aplica descuento, envío y recargo de tarjeta en ese orden', () => {
    const t = computeTotals({ subtotal: 10000, discountPercent: 10, shipping: 1000, surchargePercent: 10 });
    expect(t.discount).toBe(1000);
    expect(t.surcharge).toBe(1000); // 10% de (9000 + 1000)
    expect(t.total).toBe(11000);
  });

  it('envío "a calcular" (null) no suma', () => {
    expect(computeTotals({ subtotal: 5000, shipping: null }).total).toBe(5000);
  });

  it('el descuento nunca deja el total negativo', () => {
    expect(computeTotals({ subtotal: 500, discountFixed: 9999 }).total).toBe(0);
  });
});
