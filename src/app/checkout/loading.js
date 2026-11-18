import PageHeader from '@/components/ui/PageHeader';
import { CheckoutSkeleton } from '@/components/cart/CartSkeletons';

export default function CheckoutLoading() {
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Finalizar compra" />
      <div className="container-site">
        <CheckoutSkeleton />
      </div>
    </>
  );
}
