/**
 * Registro de secciones del sitemap
 * =================================
 * /sitemap.xml es un índice que apunta a un archivo por sección:
 *
 *   /sitemaps/pages.xml          páginas fijas (config/seo.js → STATIC_PAGES)
 *   /sitemaps/categories.xml     /tienda?category=… (solo las que tienen productos)
 *   /sitemaps/products-1.xml     fichas de producto, paginadas por el backend
 *   /sitemaps/products-2.xml     (5.000 por archivo; aparecen solas al crecer)
 *
 * Agregar una sección = agregar un objeto acá:
 *   name     nombre del archivo
 *   paged    true → products-1.xml, products-2.xml…; false → name.xml
 *   files    (ctx) → [{ page, lastmod }]   qué archivos existen y su último cambio
 *   entries  (ctx, page) → [{ path, lastmod, images }]
 *
 * El backend ya expone sets (/tienda/set/<slug>) y Pokémon (/pokemon/<slug>):
 * cuando existan esas páginas en el front, se suman con backendSection('sets')
 * y backendSection('pokemon'). Nunca listar URLs que el front no sirve: un
 * sitemap con 404 hace que Google confíe menos en él.
 */
import { STATIC_PAGES } from '@/config/seo';

const latest = (dates) => dates.filter(Boolean).sort().at(-1) || null;

/** Normaliza una fila del backend a { path, lastmod, images }. */
export function toEntry(row) {
  const images = Array.isArray(row.images) ? row.images : row.image ? [row.image] : [];
  return { path: row.path, lastmod: row.lastmod || null, images: images.filter(Boolean) };
}

/** Sección de un solo archivo que sale tal cual de /seo/sitemap/<name>/. */
export function backendSection(name, { keep = () => true } = {}) {
  const load = async ({ seo }) => (await seo.getSitemapSection(name)).filter(keep).map(toEntry);
  return {
    name,
    paged: false,
    files: async (ctx) => {
      const entries = await load(ctx);
      return entries.length ? [{ page: 1, lastmod: latest(entries.map((e) => e.lastmod)) }] : [];
    },
    entries: (ctx) => load(ctx),
  };
}

export const SITEMAP_SECTIONS = Object.freeze([
  {
    name: 'pages',
    paged: false,
    files: async ({ catalogLastmod }) => [{ page: 1, lastmod: await catalogLastmod() }],
    entries: async ({ catalogLastmod }) => {
      const lastmod = await catalogLastmod();
      return STATIC_PAGES.map((page) => ({ path: page.path, lastmod: page.catalog ? lastmod : null, images: [] }));
    },
  },
  // Una categoría sin productos no tiene lastmod: no se lista (sería una página vacía).
  backendSection('categories', { keep: (row) => Boolean(row.lastmod) }),
  {
    name: 'products',
    paged: true,
    files: async ({ seo }) => {
      const index = await seo.getSitemapIndex();
      const pages = Math.max(1, Number(index?.sections?.products) || 1);
      return Array.from({ length: pages }, (_, i) => ({ page: i + 1, lastmod: index?.lastmod || null }));
    },
    entries: async ({ seo }, page) => (await seo.getSitemapSection('products', page)).map(toEntry),
  },
]);

export const sitemapFileName = (section, page) => (section.paged ? `${section.name}-${page}.xml` : `${section.name}.xml`);

/** "products-2.xml" → { section, page } | null */
export function parseSitemapFileName(fileName, sections = SITEMAP_SECTIONS) {
  const match = /^([a-z][a-z0-9-]*?)(?:-(\d+))?\.xml$/.exec(String(fileName || ''));
  if (!match) return null;
  const [, name, rawPage] = match;
  const section = sections.find((s) => s.name === name);
  if (!section || section.paged !== (rawPage != null)) return null;
  const page = section.paged ? Number.parseInt(rawPage, 10) : 1;
  return page >= 1 ? { section, page } : null;
}

/** Contexto compartido por las secciones; el lastmod del catálogo se pide una vez y nunca rompe. */
export function createSitemapContext(seo) {
  let catalog;
  return {
    seo,
    catalogLastmod: () => {
      catalog ||= Promise.resolve()
        .then(() => seo.getSitemapIndex())
        .then((index) => index?.lastmod || null)
        .catch(() => null);
      return catalog;
    },
  };
}

/** Todos los archivos del índice: [{ file, lastmod }]. */
export async function listSitemapFiles(ctx, sections = SITEMAP_SECTIONS) {
  const perSection = await Promise.all(
    sections.map(async (section) => (await section.files(ctx)).map(({ page, lastmod }) => ({ file: sitemapFileName(section, page), lastmod }))),
  );
  return perSection.flat();
}
