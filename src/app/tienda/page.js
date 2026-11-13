import { Suspense } from 'react';
import { getServices } from '@/services/container';
import { CATEGORIES } from '@/domain/catalog';
import PageHeader from '@/components/ui/PageHeader';
import ProductGrid from '@/components/product/ProductGrid';
import ShopFilters from '@/components/shop/ShopFilters';
import Pagination from '@/components/shop/Pagination';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const { category } = await searchParams;
  const name = CATEGORIES.find((c) => c.slug === category)?.name;
  return { title: name ? `${name} Pokémon TCG` : 'Tienda', alternates: { canonical: '/tienda' } };
}

export default async function TiendaPage({ searchParams }) {
  const raw = await searchParams;
  const page = await getServices().catalog.getProductPage(raw);
  const category = CATEGORIES.find((c) => c.slug === page.filters.category);

  return (
    <>
      <PageHeader eyebrow="Tienda" title={category?.name || (page.filters.search ? `“${page.filters.search}”` : 'Todo el catálogo')}>
        {page.total} {page.total === 1 ? 'producto' : 'productos'}
      </PageHeader>
      <div className="container-site">
        <div className="mb-10">
          <Suspense>
            <ShopFilters />
          </Suspense>
        </div>
        <ProductGrid products={page.items} />
        <Pagination page={page.page} totalPages={page.totalPages} filters={page.filters} />
      </div>
    </>
  );
}
