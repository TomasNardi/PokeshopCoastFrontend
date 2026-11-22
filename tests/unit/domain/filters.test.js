import { describe, expect, it } from 'vitest';
import { normalizeFilters, splitValues, toggleValue } from '@/domain/catalog';

describe('filtros de selección múltiple', () => {
  it('agrega y saca valores sin repetir', () => {
    expect(toggleValue('', 'NM')).toBe('NM');
    expect(toggleValue('NM', 'LP')).toBe('NM,LP');
    expect(toggleValue('NM,LP', 'NM')).toBe('LP');
    expect(toggleValue('LP', 'LP')).toBe('');
  });

  it('separa por coma ignorando vacíos', () => {
    expect(splitValues(' base-set, ,151 ')).toEqual(['base-set', '151']);
    expect(splitValues(undefined)).toEqual([]);
  });

  it('la expansión y la rareza viajan a la API', () => {
    expect(normalizeFilters({ set: 'base-set', rarity: 'Holo Rare', page: '2' })).toEqual({ set: 'base-set', rarity: 'Holo Rare', page: 2 });
  });
});
