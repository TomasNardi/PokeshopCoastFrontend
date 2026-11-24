/**
 * Datos estructurados (schema.org) del sitio. El de cada producto lo arma el
 * backend (apps/seo/services.py → product_seo) y las migas ProductBreadcrumb.
 *
 * Organization/OnlineStore: nombre, logo y redes en el panel de Google.
 * WebSite: el nombre del sitio que Google muestra arriba del resultado.
 */
import { CONTACT, SITE } from '@/config/site';
import { LOGO_PATH, absoluteUrl } from '@/config/seo';

const ORGANIZATION_ID = `${absoluteUrl('/')}#organization`;
const WEBSITE_ID = `${absoluteUrl('/')}#website`;

// Mismo criterio que /arrepentimiento y el JSON-LD de producto del backend (RETURN_POLICY).
const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'AR',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 10,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
};

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': ORGANIZATION_ID,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: absoluteUrl('/'),
    logo: absoluteUrl(LOGO_PATH),
    description: SITE.description,
    email: CONTACT.email,
    telephone: CONTACT.whatsappPhone ? `+${CONTACT.whatsappPhone}` : undefined,
    sameAs: [CONTACT.instagram, CONTACT.tiktok].filter(Boolean),
    address: { '@type': 'PostalAddress', addressRegion: 'Buenos Aires', addressCountry: 'AR' },
    areaServed: { '@type': 'Country', name: 'Argentina' },
    hasMerchantReturnPolicy: RETURN_POLICY,
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: absoluteUrl('/'),
    inLanguage: 'es-AR',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/** JSON para <script type="application/ld+json">, sin `</script>` que corte el HTML. */
export const serializeJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
