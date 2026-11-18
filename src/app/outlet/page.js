import { Suspense, cache } from 'react';
import { getServices } from '@/services/container';
import { normalizeFilters } from '@/domain/catalog';
import { SkeletonText } from '@/components/ui/Skeleton';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductSkeletons';
import Pagination from '@/components/shop/Pagination';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Outlet',
  description: 'Cartas y sellados con detalles a precio de outlet. Cada producto tiene descripto su daño.',
  alternates: { canonical: '/outlet' },
};

// Una sola llamada a la API por request aunque la usen el total y la grilla.
const loadPage = cache((key) => getServices().catalog.getProductPage({ ...Object.fromEntries(new URLSearchParams(key)), outlet: 'true' }));

async function ResultCount({ queryKey }) {
  const { total } = await loadPage(queryKey);
  return `${total} ${total === 1 ? 'producto' : 'productos'}`;
}

async function Results({ queryKey }) {
  const page = await loadPage(queryKey);
  const { outlet, ...paginationFilters } = page.filters;
  return (
    <>
      <ProductGrid products={page.items} emptyMessage="Por ahora no hay productos en el outlet." />
      <Pagination page={page.page} totalPages={page.totalPages} filters={paginationFilters} basePath="/outlet" />
    </>
  );
}

/** Outlet: productos dañados o con detalles, siempre con el daño descripto. */
export default async function OutletPage({ searchParams }) {
  const { outlet, ...filters } = normalizeFilters(await searchParams);
  const queryKey = new URLSearchParams(filters).toString();

  return (
    <>
      <header className="container-site pb-8 pt-10 md:pb-10 md:pt-14">
        <p className="eyebrow mb-3">Precios especiales</p>
        <h1 className="font-heading text-[40px] font-bold leading-none text-coast-red-dark md:text-[64px]">Outlet</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-uns-muted">
          Cartas y sellados con detalles: dobleces, rayones, cajas golpeadas. Cada producto tiene el daño descripto en su
          ficha y la foto es la de la pieza que recibís.
        </p>
        <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.1em] text-black">
          <Suspense key={queryKey} fallback={<SkeletonText width="96px" />}>
            <ResultCount queryKey={queryKey} />
          </Suspense>
        </p>
      </header>
      <div className="container-site">
        <Suspense key={queryKey} fallback={<ProductGridSkeleton />}>
          <Results queryKey={queryKey} />
        </Suspense>
      </div>
    </>
  );
}
