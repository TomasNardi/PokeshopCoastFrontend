import { toQuery } from '../http/httpClient';

/**
 * SEO contra Django (apps/seo):
 *   getSitemapIndex() → { sections: { products: nPáginas, … }, page_size, lastmod }
 *   getSitemapSection(section, page) → [{ path, lastmod, images?, … }]
 *   resolveRedirect(path) → '/tienda/slug-nuevo' | null   (slugs renombrados)
 *
 * El sitemap se cachea 15 min en el data cache de Next (lo mismo que cachea el
 * backend): Google lo pide seguido y el backend en Render free puede estar dormido.
 */
export function createHttpSeoRepository(http) {
  const sitemap = { next: { revalidate: 900, tags: ['sitemap'] } };

  return {
    getSitemapIndex: () => http.get('/seo/sitemap/', sitemap),
    getSitemapSection: async (section, page = 1) => {
      const data = await http.get(`/seo/sitemap/${encodeURIComponent(section)}/${toQuery({ page })}`, sitemap);
      return Array.isArray(data?.results) ? data.results : [];
    },
    // Nunca rompe: si el backend falla, la página sigue siendo un 404 normal.
    resolveRedirect: async (path) => {
      try {
        const data = await http.get(`/seo/resolve/${toQuery({ path })}`, { cache: 'no-store' });
        return typeof data?.to === 'string' && data.to.startsWith('/') ? data.to : null;
      } catch {
        return null;
      }
    },
  };
}

/** Para tests y modo mocks: sitemap vacío, sin redirecciones. */
export function createMockSeoRepository({ index = { sections: { products: 1 }, lastmod: null }, sections = {}, redirects = {} } = {}) {
  return {
    getSitemapIndex: async () => index,
    getSitemapSection: async (section, page = 1) => sections[`${section}-${page}`] || sections[section] || [],
    resolveRedirect: async (path) => redirects[path] || null,
  };
}
