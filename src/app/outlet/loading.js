import { PageHeaderSkeleton, ProductGridSkeleton } from '@/components/product/ProductSkeletons';

export default function OutletLoading() {
  return (
    <>
      <PageHeaderSkeleton eyebrow="Precios especiales" />
      <div className="container-site">
        <ProductGridSkeleton />
      </div>
    </>
  );
}
