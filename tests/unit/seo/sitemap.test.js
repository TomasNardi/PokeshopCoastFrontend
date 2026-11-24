import { describe, expect, it } from 'vitest';
import { escapeXml, sitemapIndexXml, urlsetXml, w3cDate } from '@/seo/sitemap/xml';
import {
  SITEMAP_SECTIONS,
  createSitemapContext,
  listSitemapFiles,
  parseSitemapFileName,
  toEntry,
} from '@/seo/sitemap/sections';
import { createMockSeoRepository } from '@/services/seo/seoRepository.http';
import { STATIC_PAGES, absoluteUrl } from '@/config/seo';
import { shopIndexing } from '@/seo/indexing';
import { GET as indexRoute } from '@/app/sitemap.xml/route';
import { GET as fileRoute } from '@/app/sitemaps/[file]/route';
import { setServicesForTesting } from '@/services/container';

const seoRepo = (overrides = {}) =>
  createMockSeoRepository({
    index: { sections: { products: 2 }, lastmod: '2026-11-20T10:00:00-03:00' },
    sections: {
      categories: [
        { path: '/tienda?category=singles', lastmod: '2026-11-19T10:00:00Z' },
        { path: '/tienda?category=vacia', lastmod: null },
      ],
      'products-1': [{ path: '/tienda/charizard-ex', lastmod: '2026-11-18T10:00:00Z', images: ['https://media.test/a.webp', '/products/b.webp'] }],
    },
    ...overrides,
  });

describe('xml del sitemap', () => {
  it('escapa los caracteres reservados (las categorías llevan &)', () => {
    expect(escapeXml(`/tienda?a=1&b="2"<'`)).toBe('/tienda?a=1&amp;b=&quot;2&quot;&lt;&apos;');
  });

  it('lastmod inválido o vacío no se emite', () => {
    expect(w3cDate('nada')).toBeNull();
    expect(w3cDate(null)).toBeNull();
    expect(w3cDate('2026-11-20T10:00:00-03:00')).toBe('2026-11-20T13:00:00.000Z');
    expect(urlsetXml([{ loc: 'https://x.test/', lastmod: 'nada' }])).not.toContain('<lastmod>');
  });

  it('urlset con extensión de imágenes; índice con sus sitemaps', () => {
    const xml = urlsetXml([{ loc: 'https://x.test/p', lastmod: '2026-11-20T00:00:00Z', images: ['https://x.test/a.webp'] }]);
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(xml).toContain('<url><loc>https://x.test/p</loc><lastmod>2026-11-20T00:00:00.000Z</lastmod><image:image><image:loc>https://x.test/a.webp</image:loc></image:image></url>');
    expect(sitemapIndexXml([{ loc: 'https://x.test/sitemaps/pages.xml' }])).toContain('<sitemap><loc>https://x.test/sitemaps/pages.xml</loc></sitemap>');
  });
});

describe('secciones del sitemap', () => {
  it('nombres de archivo: las paginadas llevan número, las demás no', () => {
    const products = SITEMAP_SECTIONS.find((s) => s.name === 'products');
    expect(parseSitemapFileName('products-2.xml')).toEqual({ section: products, page: 2 });
    expect(parseSitemapFileName('pages.xml')?.section.name).toBe('pages');
    expect(parseSitemapFileName('products.xml')).toBeNull();
    expect(parseSitemapFileName('pages-1.xml')).toBeNull();
    expect(parseSitemapFileName('products-0.xml')).toBeNull();
    expect(parseSitemapFileName('nada.xml')).toBeNull();
    expect(parseSitemapFileName('../etc/passwd')).toBeNull();
  });

  it('el índice lista páginas fijas, categorías con productos y una entrada por página de productos', async () => {
    const files = await listSitemapFiles(createSitemapContext(seoRepo()));
    expect(files.map((f) => f.file)).toEqual(['pages.xml', 'categories.xml', 'products-1.xml', 'products-2.xml']);
    expect(files.find((f) => f.file === 'categories.xml').lastmod).toBe('2026-11-19T10:00:00Z');
  });

  it('sin categorías con productos no hay categories.xml', async () => {
    const files = await listSitemapFiles(createSitemapContext(seoRepo({ sections: { categories: [{ path: '/tienda?category=x', lastmod: null }] } })));
    expect(files.map((f) => f.file)).not.toContain('categories.xml');
  });

  it('páginas fijas: las del catálogo toman el último cambio del catálogo; si el backend falla, salen igual', async () => {
    const pages = SITEMAP_SECTIONS.find((s) => s.name === 'pages');
    const entries = await pages.entries(createSitemapContext(seoRepo()));
    expect(entries).toHaveLength(STATIC_PAGES.length);
    expect(entries.find((e) => e.path === '/tienda').lastmod).toBe('2026-11-20T10:00:00-03:00');
    expect(entries.find((e) => e.path === '/terminos').lastmod).toBeNull();

    const broken = { ...seoRepo(), getSitemapIndex: async () => { throw new Error('dormido'); } };
    const fallback = await pages.entries(createSitemapContext(broken));
    expect(fallback.map((e) => e.path)).toEqual(STATIC_PAGES.map((p) => p.path));
  });

  it('acepta la fila vieja del backend (image) y la nueva (images)', () => {
    expect(toEntry({ path: '/p', image: 'a' }).images).toEqual(['a']);
    expect(toEntry({ path: '/p', images: ['a', '', 'b'] }).images).toEqual(['a', 'b']);
    expect(toEntry({ path: '/p' }).images).toEqual([]);
  });
});

describe('rutas /sitemap.xml y /sitemaps/[file]', () => {
  const withSeo = (seo) => setServicesForTesting({ seo });
  const call = (file) => fileRoute(new Request('http://x.test'), { params: Promise.resolve({ file }) });

  it('índice con URLs absolutas y cache de CDN', async () => {
    withSeo(seoRepo());
    const res = await indexRoute();
    const xml = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/xml');
    expect(res.headers.get('cache-control')).toContain('s-maxage');
    expect(xml).toContain(`<loc>${absoluteUrl('/sitemaps/products-2.xml')}</loc>`);
  });

  it('productos con imágenes absolutas', async () => {
    withSeo(seoRepo());
    const xml = await (await call('products-1.xml')).text();
    expect(xml).toContain(`<loc>${absoluteUrl('/tienda/charizard-ex')}</loc>`);
    expect(xml).toContain('<image:loc>https://media.test/a.webp</image:loc>');
    expect(xml).toContain(`<image:loc>${absoluteUrl('/products/b.webp')}</image:loc>`);
  });

  it('archivo inexistente → 404; backend caído → 503 (nunca un sitemap vacío)', async () => {
    withSeo(seoRepo());
    expect((await call('nada.xml')).status).toBe(404);
    expect((await call('products-9.xml')).status).toBe(404);

    withSeo({ ...seoRepo(), getSitemapIndex: async () => { throw new Error('x'); }, getSitemapSection: async () => { throw new Error('x'); } });
    const res = await call('products-1.xml');
    expect(res.status).toBe(503);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect((await indexRoute()).status).toBe(503);
  });
});

describe('indexación de /tienda', () => {
  it('categoría y página se indexan con canonical propio', () => {
    expect(shopIndexing({ page: 1 })).toEqual({ canonical: '/tienda', indexable: true });
    expect(shopIndexing({ category: 'slabs', page: 1 })).toEqual({ canonical: '/tienda?category=slabs', indexable: true });
    expect(shopIndexing({ category: 'slabs', page: 3 })).toEqual({ canonical: '/tienda?category=slabs&page=3', indexable: true });
  });

  it('búsquedas, orden y filtros finos no se indexan', () => {
    expect(shopIndexing({ search: 'charizard', page: 1 }).indexable).toBe(false);
    expect(shopIndexing({ category: 'singles', ordering: 'price_ars', page: 1 })).toEqual({ canonical: '/tienda?category=singles', indexable: false });
    expect(shopIndexing({ rarity: 'Holo', page: 1 }).indexable).toBe(false);
  });
});
