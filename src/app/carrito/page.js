import PageHeader from '@/components/ui/PageHeader';
import CartPageContent from '@/components/cart/CartPageContent';

export const metadata = { title: 'Carrito', robots: { index: false } };

export default function CarritoPage() {
  return (
    <>
      <PageHeader eyebrow="Carrito" title="Tu carrito" />
      <div className="container-site">
        <CartPageContent />
      </div>
    </>
  );
}
