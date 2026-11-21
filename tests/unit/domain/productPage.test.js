import { describe, expect, it } from 'vitest';
import { defaultDescription, languageSentence, productKind, productView } from '@/domain/product';
import { createCatalogService } from '@/services/catalog/catalogService';

describe('ficha: tipo, idioma y textos', () => {
  it('saca el tipo de la categoría', () => {
    expect(productKind({ category: { slug: 'sellados' } })).toBe('sealed');
    expect(productKind({ category: { slug: 'accesorios' } })).toBe('accessory');
    expect(productKind({ category: { slug: 'slabs' } })).toBe('slab');
    expect(productKind({ category: { slug: 'singles' } })).toBe('single');
  });

  it('un sellado no promete "la foto es de la carta"', () => {
    const view = productView({ id: 1, slug: 'etb', name: 'ETB', category: { slug: 'sellados', name: 'Sellados' }, language: 'en' });
    expect(view.trustLine).not.toMatch(/carta/);
    expect(view.languageSentence).toBe('Este producto está en inglés');
  });

  it('frase del idioma como unsobremas', () => {
    expect(languageSentence({ code: 'es' })).toBe('Este producto está en castellano');
    expect(languageSentence(null)).toBe('');
  });

  it('descripción por defecto según el tipo', () => {
    expect(defaultDescription('sealed', { setName: '30th' })[0]).toMatch(/sellado de fábrica de la expansión 30th/);
    expect(defaultDescription('single', { name: 'Pikachu' }).join(' ')).toMatch(/carta exacta/);
  });
});

describe('getSuggestions', () => {
  const product = { id: 1, slug: 'etb', category: { slug: 'sellados' } };

  it('usa las vidrieras del backend', async () => {
    const service = createCatalogService({ getSuggestions: async () => ({ related: [{ id: 2 }], complete: [{ id: 3 }] }) });
    expect(await service.getSuggestions(product)).toEqual({ related: [{ id: 2 }], complete: [{ id: 3 }] });
  });

  it('si el endpoint falla, cae a la lista por categoría y no rompe la ficha', async () => {
    const service = createCatalogService({
      getSuggestions: async () => { throw new Error('404'); },
      listProducts: async () => ({ results: [{ id: 1 }, { id: 5 }] }),
    });
    expect(await service.getSuggestions(product)).toEqual({ related: [{ id: 5 }], complete: [] });
  });
});
