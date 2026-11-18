/**
 * Esqueletos de carrito y checkout. El carrito vive en localStorage, así que
 * hasta hidratar no se sabe qué hay: se muestra la forma de la página.
 */
import { LoadingRegion, Skeleton } from '@/components/ui/Skeleton';

const range = (n) => Array.from({ length: n }, (_, i) => i);

function SummaryCardSkeleton({ lines = 3, title = true }) {
  return (
    <div className="h-fit rounded-2xl border border-coast-line bg-white p-6">
      {title && <Skeleton className="mb-5 h-6 w-28" />}
      <div className="space-y-3">
        {range(lines).map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-12 w-full" />
    </div>
  );
}

/** Misma grilla que CartPageContent: líneas a la izquierda, resumen a la derecha. */
export function CartPageSkeleton() {
  return (
    <LoadingRegion label="Cargando tu carrito" className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-coast-line rounded-2xl border border-coast-line bg-white px-6">
        {range(2).map((i) => (
          <li key={i} className="flex gap-4 py-4">
            <Skeleton className="h-24 w-20 shrink-0" />
            <div className="flex flex-1 flex-col">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="mt-2 h-3 w-1/4" />
              <div className="mt-auto flex items-center justify-between pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <SummaryCardSkeleton lines={1} title={false} />
    </LoadingRegion>
  );
}

/** Misma grilla que CheckoutForm: tres pasos y el resumen del pedido. */
export function CheckoutSkeleton() {
  return (
    <LoadingRegion label="Cargando el checkout" className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        {[4, 3, 2].map((fields, step) => (
          <div key={step} className="rounded-2xl border border-coast-line bg-white p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {range(fields).map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <SummaryCardSkeleton lines={4} />
    </LoadingRegion>
  );
}
