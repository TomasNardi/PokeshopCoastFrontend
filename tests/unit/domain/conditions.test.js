import { describe, expect, it } from 'vitest';
import { getCondition } from '@/domain/conditions';
import { normalizeFilters } from '@/domain/catalog';

describe('getCondition', () => {
  it.each([
    ['Mint', 'M'],
    ['NEAR MINT', 'NM'],
    [' lightly played ', 'LP'],
    ['Moderate Played', 'MP'],
    ['Damage', 'D'],
  ])('%s → %s (mismos estados que Crack)', (name, abbr) => {
    expect(getCondition(name).abbr).toBe(abbr);
  });

  it('un estado desconocido no rompe: usa el nombre tal cual', () => {
    expect(getCondition('Poor')).toMatchObject({ label: 'Poor', abbr: 'P' });
  });

  it('sin nombre devuelve null', () => {
    expect(getCondition('')).toBeNull();
  });
});

describe('normalizeFilters', () => {
  it('limpia vacíos, toma el primer valor de arrays y descarta claves desconocidas', () => {
    expect(normalizeFilters({ category: ['slabs', 'x'], search: '', hack: '1', page: '2' })).toEqual({ category: 'slabs', page: 2 });
  });

  it('página inválida → 1', () => {
    expect(normalizeFilters({ page: '-3' }).page).toBe(1);
    expect(normalizeFilters({ page: 'abc' }).page).toBe(1);
  });
});
