import { getServices } from '@/services/container';
import { absoluteUrl } from '@/config/seo';
import { createSitemapContext, parseSitemapFileName } from '@/seo/sitemap/sections';
import { urlsetXml } from '@/seo/sitemap/xml';
import { notFoundResponse, unavailableResponse, xmlResponse } from '@/seo/sitemap/response';

// Se arma en cada pedido al origen; el cache lo hace el CDN (Cache-Control en response.js).
export const dynamic = 'force-dynamic';

/** Un archivo del sitemap: /sitemaps/pages.xml, /sitemaps/products-1.xml, … */
export async function GET(_request, { params }) {
  const { file } = await params;
  const target = parseSitemapFileName(file);
  if (!target) return notFoundResponse();

  try {
    const entries = await target.section.entries(createSitemapContext(getServices().seo), target.page);
    // products-7.xml cuando hay 2 páginas no existe (la página 1 vacía sí es válida).
    if (entries.length === 0 && target.page > 1) return notFoundResponse();
    return xmlResponse(
      urlsetXml(entries.map((e) => ({ loc: absoluteUrl(e.path), lastmod: e.lastmod, images: e.images.map(absoluteUrl) }))),
    );
  } catch (error) {
    console.error(`[sitemap] ${file}:`, error?.message || error);
    return unavailableResponse();
  }
}
