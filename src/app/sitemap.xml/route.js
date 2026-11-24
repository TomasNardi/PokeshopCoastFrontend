import { getServices } from '@/services/container';
import { absoluteUrl } from '@/config/seo';
import { createSitemapContext, listSitemapFiles } from '@/seo/sitemap/sections';
import { sitemapIndexXml } from '@/seo/sitemap/xml';
import { unavailableResponse, xmlResponse } from '@/seo/sitemap/response';

// Se arma en cada pedido al origen; el cache lo hace el CDN (Cache-Control en response.js).
export const dynamic = 'force-dynamic';

/** Índice de sitemaps: lo que se carga en Search Console y anuncia robots.txt. */
export async function GET() {
  try {
    const files = await listSitemapFiles(createSitemapContext(getServices().seo));
    return xmlResponse(sitemapIndexXml(files.map(({ file, lastmod }) => ({ loc: absoluteUrl(`/sitemaps/${file}`), lastmod }))));
  } catch (error) {
    console.error('[sitemap] índice:', error?.message || error);
    return unavailableResponse();
  }
}
