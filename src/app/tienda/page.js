import { Suspense, cache } from 'react';
import { getServices } from '@/services/container';
import { CATEGORIES, normalizeFilters } from '@/domain/catalog';
import PageHeader from '@/components/ui/PageHeader';
import { SkeletonText } from '@/components/ui/Skeleton';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton, ShopFiltersSkeleton } from '@/components/product/ProductSkeletons';
import ShopFilters from '@/components/shop/ShopFilters';
import Pagination from '@/components/shop/Pagination';
import { NOINDEX_FOLLOW, shopIndexing } from '@/seo/indexing';
import { openGraph } from '@/config/seo';
import { SITE } from '@/config/site';

export const dynamic = 'force-dynamic';

/** Clave estable de los filtros: identifica la búsqueda y deduplica el pedido. */
const keyOf = (params) => new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();

// Una sola llamada a la API por request aunque la usen el total y la grilla.
const loadPage = cache((key) => getServices().catalog.getProductPage(Object.fromEntries(new URLSearchParams(key))));

export async function generateMetadata({ searchParams }) {
  const filters = normalizeFilters(await searchParams);
  const category = CATEGORIES.find((c) => c.slug === filters.category);
  const { canonical, indexable } = shopIndexing(filters);
  const pageSuffix = filters.page > 1 ? ` — Página ${filters.page}` : '';
  const title = `${category ? `${category.name} Pokémon TCG` : 'Tienda de cartas Pokémon TCG'}${pageSuffix}`;
  const description = category
    ? `${category.name} de Pokémon TCG en Argentina: ${category.blurb.toLowerCase()}. Envíos a todo el país y pago con Mercado Pago.`
    : SITE.description;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: openGraph({ url: canonical, title: `${title} | ${SITE.name}`, description }),
    ...(indexable ? {} : { robots: NOINDEX_FOLLOW }),
  };
}

async function ResultCount({ queryKey }) {
  const { total } = await loadPage(queryKey);
  return `${total} ${total === 1 ? 'producto' : 'productos'}`;
}

async function Results({ queryKey }) {
  const page = await loadPage(queryKey);
  return (
    <>
      <ProductGrid products={page.items} />
      <Pagination page={page.page} totalPages={page.totalPages} filters={page.filters} />
    </>
  );
}

/**
 * El encabezado y los filtros salen al instante. El total y la grilla esperan
 * a la API; la `key` hace que con cada filtro o página nueva vuelva a verse el
 * esqueleto en vez de quedar la grilla vieja congelada.
 */
export default async function TiendaPage({ searchParams }) {
  const filters = normalizeFilters(await searchParams);
  const queryKey = keyOf(filters);
  const category = CATEGORIES.find((c) => c.slug === filters.category);
  const title = category?.name || (filters.search ? `“${filters.search}”` : 'Todo el catálogo');

  return (
    <>
      <PageHeader eyebrow="Tienda" title={title}>
        <Suspense key={queryKey} fallback={<SkeletonText width="96px" />}>
          <ResultCount queryKey={queryKey} />
        </Suspense>
      </PageHeader>
      <div className="container-site">
        <div className="mb-10">
          <Suspense fallback={<ShopFiltersSkeleton />}>
            <ShopFilters />
          </Suspense>
        </div>
        <Suspense key={queryKey} fallback={<ProductGridSkeleton />}>
          <Results queryKey={queryKey} />
        </Suspense>
      </div>
    </>
  );
}
