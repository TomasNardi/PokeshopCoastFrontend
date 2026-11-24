import { PRIVATE_PATHS, absoluteUrl } from '@/config/seo';

/**
 * Los filtros de /tienda NO se bloquean acá: llevan noindex,follow (ver
 * seo/indexing.js). Si se bloquearan, Google no vería el noindex y podría
 * indexar la URL igual, sin contenido.
 */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: [...PRIVATE_PATHS] }],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
