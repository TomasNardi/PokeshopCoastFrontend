import { PageHeaderSkeleton, ProductGridSkeleton, ShopFiltersSkeleton } from '@/components/product/ProductSkeletons';

/** Primera entrada a /tienda: encabezado, filtros y grilla con la forma final. */
export default function TiendaLoading() {
  return (
    <>
      <PageHeaderSkeleton eyebrow="Tienda" />
      <div className="container-site">
        <div className="mb-10">
          <ShopFiltersSkeleton />
        </div>
        <ProductGridSkeleton />
      </div>
    </>
  );
}
