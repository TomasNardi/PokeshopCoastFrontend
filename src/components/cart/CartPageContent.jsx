'use client';
import { selectSubtotal, useCartStore } from '@/store/cartStore';
import { useHydrated } from '@/hooks/useHydrated';
import { formatPrice } from '@/domain/money';
import Button from '@/components/ui/Button';
import CartLine from './CartLine';

export default function CartPageContent() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);

  if (!hydrated) return <div className="h-64" />;
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-coast-gray">Todavía no agregaste nada.</p>
        <Button href="/tienda" className="mt-6">Ir a la tienda</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
      <ul className="fade-up min-w-0 divide-y divide-uns-hairline border border-uns-hairline bg-white px-4 sm:px-6">
        {items.map((item) => (
          <CartLine key={item.id} item={item} />
        ))}
      </ul>
      <aside className="fade-up h-fit border border-uns-hairline bg-white p-5 sm:p-6 lg:sticky lg:top-24" style={{ '--delay': '0.12s' }}>
        <div className="flex justify-between text-lg font-bold">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-2 text-[12px] text-coast-gray">Envío, descuentos y recargos se calculan en el checkout.</p>
        <Button href="/checkout" size="lg" block className="mt-6">Finalizar compra</Button>
      </aside>
    </div>
  );
}
