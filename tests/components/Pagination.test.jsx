import { describe, expect, it } from 'vitest';
import { pageWindow } from '@/components/shop/Pagination';

describe('pageWindow', () => {
  it('muestra primera, última y vecinas con saltos', () => {
    expect(pageWindow(50, 106)).toEqual([1, '…', 49, 50, 51, '…', 106]);
  });

  it('en los bordes no repite ni deja saltos vacíos', () => {
    expect(pageWindow(1, 106)).toEqual([1, 2, '…', 106]);
    expect(pageWindow(106, 106)).toEqual([1, '…', 105, 106]);
  });

  it('un solo número escondido se muestra en vez de "…"', () => {
    expect(pageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});
