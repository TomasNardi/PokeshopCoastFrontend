import { serializeJsonLd } from '@/seo/structuredData';

/** Un bloque de datos estructurados. Server component: va en el HTML del SSR. */
export default function JsonLd({ data }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
