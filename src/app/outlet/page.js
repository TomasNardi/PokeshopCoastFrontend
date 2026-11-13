import { getServices } from '@/services/container';
import ProductGrid from '@/components/product/ProductGrid';
import Pagination from '@/components/shop/Pagination';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Outlet',
  description: 'Cartas y sellados con detalles a precio de outlet. Cada producto tiene descripto su daño.',
  alternates: { canonical: '/outlet' },
};

/** Outlet: productos dañados o con detalles, siempre con el daño descripto. */
export default async function OutletPage({ searchParams }) {
  const raw = await searchParams;
  const page = await getServices().catalog.getProductPage({ ...raw, outlet: 'true' });
  const { outlet, ...paginationFilters } = page.filters;

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
          {page.total} {page.total === 1 ? 'producto' : 'productos'}
        </p>
      </header>
      <div className="container-site">
        <ProductGrid products={page.items} emptyMessage="Por ahora no hay productos en el outlet." />
        <Pagination page={page.page} totalPages={page.totalPages} filters={paginationFilters} basePath="/outlet" />
      </div>
    </>
  );
}
