/**
 * Esqueletos del catálogo. Usan las MISMAS clases que los componentes reales
 * (.product-item, .stage--card, .product-grid, .rail-item…), así ocupan
 * exactamente el mismo lugar y cuando llegan los productos nada se mueve.
 */
import { LoadingRegion, Skeleton, SkeletonText } from '@/components/ui/Skeleton';

const range = (n) => Array.from({ length: n }, (_, i) => i);

// Anchos variados: una fila de líneas idénticas se ve artificial.
const TITLE_WIDTHS = ['82%', '64%', '74%', '58%'];
const SUBTITLE_WIDTHS = ['48%', '60%', '40%', '54%'];

export function ProductCardSkeleton({ index = 0 }) {
  return (
    <div className="product-item">
      <div className="product-item__media">
        <Skeleton as="div" className="stage stage--card rounded-none" />
      </div>
      <div className="product-item__info">
        <p className="product-item__title"><SkeletonText width={TITLE_WIDTHS[index % 4]} /></p>
        <p className="product-item__category"><SkeletonText width={SUBTITLE_WIDTHS[index % 4]} /></p>
        <p className="product-item__price"><SkeletonText width="28%" /></p>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, mobileSlider = false, label = 'Cargando productos' }) {
  return (
    <LoadingRegion label={label} className={`product-grid ${mobileSlider ? 'product-grid--mobile-slider hide-scrollbar' : ''}`}>
      {range(count).map((i) => (
        <ProductCardSkeleton key={i} index={i} />
      ))}
    </LoadingRegion>
  );
}

/** Misma estructura que ProductRail: título real (ya se sabe cuál es) y cards falsas. */
export function ProductRailSkeleton({ id, title, count = 4 }) {
  return (
    <section id={id} className="rail scroll-mt-[var(--header-height)] pb-8 pt-12 md:pt-[50px]">
      <div className="container-site mb-[15px] flex items-end justify-between gap-6">
        {title ? <h2 className="section-heading">{title}</h2> : <Skeleton className="h-8 w-56" />}
        <span className="h-10" aria-hidden="true" />
      </div>
      <LoadingRegion
        label={title ? `Cargando ${title.toLowerCase()}` : 'Cargando productos'}
        className="rail-track hide-scrollbar flex gap-[5px] overflow-hidden px-[var(--outer)]"
      >
        {range(count).map((i) => (
          <div key={i} className="rail-item w-[calc(100%+var(--outer)-120px)] shrink-0">
            <ProductCardSkeleton index={i} />
          </div>
        ))}
      </LoadingRegion>
    </section>
  );
}

/** Ficha de producto: galería cuadrada + columna de datos, como tienda/[slug]/page.js. */
export function ProductDetailSkeleton() {
  return (
    <LoadingRegion label="Cargando producto">
      <div className="container-site pt-8">
        <Skeleton className="h-4 w-20" />
      </div>
      <section className="container-site grid gap-10 py-8 lg:grid-cols-2 lg:gap-16">
        <Skeleton as="div" className="stage stage--detail rounded-none" />
        <div className="lg:pt-6">
          <Skeleton className="mb-4 h-3 w-32" />
          <Skeleton className="h-10 w-4/5 sm:h-12" />
          <Skeleton className="mt-3 h-10 w-3/5 sm:h-12" />
          <Skeleton className="mt-4 h-3.5 w-40" />
          <Skeleton className="mt-7 h-8 w-36" />
          <div className="mt-7 space-y-3">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="mt-8 h-14 w-full" />
          <Skeleton as="div" className="mt-8 h-[124px] w-full rounded-none" />
          <div className="mt-8 space-y-4">
            {range(5).map((i) => (
              <div key={i} className="flex justify-between gap-4 border-b border-coast-line pb-3">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </LoadingRegion>
  );
}

/** Encabezado de listados (tienda, outlet) mientras se sabe el título o el total. */
export function PageHeaderSkeleton({ eyebrow }) {
  return (
    <header className="container-site pb-8 pt-10 md:pb-10 md:pt-14">
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : <Skeleton className="mb-3 h-3 w-20" />}
      <h1 className="font-heading text-[40px] font-bold leading-none md:text-[64px]">
        <SkeletonText width="min(420px, 70%)" />
      </h1>
      <div className="mt-4 text-[15px] leading-relaxed">
        <SkeletonText width="96px" />
      </div>
    </header>
  );
}

/** Fila de filtros de la tienda (chips + selects) para la primera carga de /tienda. */
export function ShopFiltersSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="flex flex-wrap items-center gap-2">
        {[92, 72, 104, 88, 96, 104].map((w, i) => (
          <Skeleton key={i} className="h-[34px] rounded-none" style={{ width: w }} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {[132, 124, 160].map((w, i) => (
          <Skeleton key={i} className="h-[38px]" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}
