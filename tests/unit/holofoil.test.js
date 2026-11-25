import { describe, expect, it } from 'vitest';
import { isHolofoil } from '@/domain/productTraits';
import { productView } from '@/domain/product';

describe('Holofoil', () => {
  it('marca las variantes holo de TCGplayer y no la reverse', () => {
    expect(isHolofoil('Holofoil')).toBe(true);
    expect(isHolofoil('Unlimited Holofoil')).toBe(true);
    expect(isHolofoil('1st Edition Holofoil')).toBe(true);
    expect(isHolofoil('Reverse Holofoil')).toBe(false);
    expect(isHolofoil('Normal')).toBe(false);
    expect(isHolofoil('')).toBe(false);
    expect(isHolofoil(undefined)).toBe(false);
  });

  it('llega a la vista del producto', () => {
    expect(productView({ id: 1, slug: 'x', name: 'X', finish: 'Holofoil' }).isHolofoil).toBe(true);
    expect(productView({ id: 2, slug: 'y', name: 'Y', finish: 'Reverse Holofoil' }).isHolofoil).toBe(false);
  });
});
