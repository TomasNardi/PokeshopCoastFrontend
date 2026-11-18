import { Skeleton } from '@/components/ui/Skeleton';
import { SkeletonRows } from '@/components/account/ui';

/** Entre secciones de "Mi cuenta": el marco queda y solo el contenido muestra el esqueleto. */
export default function AccountSectionLoading() {
  return (
    <div>
      <Skeleton className="mb-5 h-8 w-48" />
      <SkeletonRows rows={3} />
    </div>
  );
}
