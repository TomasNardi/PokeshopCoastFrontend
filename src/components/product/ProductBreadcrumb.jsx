import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { absoluteUrl } from '@/config/seo';
import JsonLd from '@/components/seo/JsonLd';

/**
 * Inicio › Tienda › Categoría › Producto, con su BreadcrumbList para Google
 * (las migas aparecen en el resultado de búsqueda en vez de la URL).
 */
export default function ProductBreadcrumb({ category, categorySlug, name }) {
  const items = [
    { label: 'Inicio', href: '/' },
    { label: 'Tienda', href: '/tienda' },
    category && categorySlug ? { label: category, href: `/tienda?category=${encodeURIComponent(categorySlug)}` } : null,
    { label: name },
  ].filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Estás en" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-uns-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label} className={`flex min-w-0 items-center gap-1 ${last ? 'hidden truncate text-coast-ink sm:flex' : 'shrink-0'}`}>
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-coast-ink">{item.label}</Link>
              ) : (
                <span aria-current="page" className="truncate">{item.label}</span>
              )}
              {!last && <ChevronRight size={12} strokeWidth={2.5} aria-hidden="true" className={index === items.length - 2 ? 'hidden sm:block' : ''} />}
            </li>
          );
        })}
      </ol>
      <JsonLd data={jsonLd} />
    </nav>
  );
}
