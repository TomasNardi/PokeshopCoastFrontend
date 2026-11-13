import { SITE } from '@/config/site';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/checkout', '/cuenta', '/carrito'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
