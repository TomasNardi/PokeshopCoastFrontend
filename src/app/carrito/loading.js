import PageHeader from '@/components/ui/PageHeader';
import { CartPageSkeleton } from '@/components/cart/CartSkeletons';

export default function CarritoLoading() {
  return (
    <>
      <PageHeader eyebrow="Carrito" title="Tu carrito" />
      <div className="container-site">
        <CartPageSkeleton />
      </div>
    </>
  );
}
