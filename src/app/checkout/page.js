import PageHeader from '@/components/ui/PageHeader';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata = { title: 'Finalizar compra', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Finalizar compra" />
      <div className="container-site">
        <CheckoutForm />
      </div>
    </>
  );
}
