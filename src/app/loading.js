import { LoadingRegion, Skeleton } from '@/components/ui/Skeleton';

/**
 * Carga genérica para las páginas sin esqueleto propio (contacto, envíos,
 * legales…): título y párrafos con el ancho del contenido real.
 */
export default function Loading() {
  return (
    <LoadingRegion label="Cargando página" className="container-site pb-20 pt-10 md:pt-14">
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="h-10 w-2/3 max-w-[520px] md:h-16" />
      <div className="mt-10 max-w-2xl space-y-3">
        {['100%', '94%', '97%', '62%'].map((width, i) => (
          <Skeleton key={i} className="h-3.5" style={{ width }} />
        ))}
      </div>
    </LoadingRegion>
  );
}
