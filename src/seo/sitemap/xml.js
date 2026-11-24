/**
 * Serializadores del protocolo sitemaps.org (+ extensión de imágenes de Google).
 * Funciones puras: entran entradas normalizadas, sale el XML.
 *
 * Solo se emite lo que Google usa: <loc>, <lastmod> (si es real) e <image:loc>.
 * changefreq y priority Google los ignora, así que no se mandan.
 */

export const MAX_URLS_PER_SITEMAP = 50000; // límite del protocolo
const MAX_IMAGES_PER_URL = 1000; // límite de Google

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
export const escapeXml = (value) => String(value).replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);

/** Fecha W3C o null: un lastmod inválido es peor que ninguno (Google deja de confiar en el sitemap). */
export function w3cDate(value) {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const lastmodTag = (value) => {
  const date = w3cDate(value);
  return date ? `<lastmod>${date}</lastmod>` : '';
};

/** @param {{ loc: string, lastmod?: string, images?: string[] }[]} urls  URLs absolutas */
export function urlsetXml(urls) {
  const body = urls
    .slice(0, MAX_URLS_PER_SITEMAP)
    .map(({ loc, lastmod, images = [] }) => {
      const imageTags = images
        .slice(0, MAX_IMAGES_PER_URL)
        .map((src) => `<image:image><image:loc>${escapeXml(src)}</image:loc></image:image>`)
        .join('');
      return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag(lastmod)}${imageTags}</url>`;
    })
    .join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    `${body}\n</urlset>\n`
  );
}

/** @param {{ loc: string, lastmod?: string }[]} sitemaps  URLs absolutas */
export function sitemapIndexXml(sitemaps) {
  const body = sitemaps.map(({ loc, lastmod }) => `<sitemap><loc>${escapeXml(loc)}</loc>${lastmodTag(lastmod)}</sitemap>`).join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${body}\n</sitemapindex>\n`
  );
}
