import { LoadingRegion, Skeleton } from '@/components/ui/Skeleton';

/** Forma del LoginForm (Google, separador, pestañas, dos campos y botón). */
export function LoginFormSkeleton() {
  return (
    <LoadingRegion label="Cargando">
      <Skeleton className="h-[52px] w-full" />
      <Skeleton className="mx-auto my-6 h-3 w-28" />
      <Skeleton className="h-11 w-full rounded-full" />
      <div className="mt-6 space-y-5">
        {[0, 1].map((i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-[52px] w-full" />
    </LoadingRegion>
  );
}
