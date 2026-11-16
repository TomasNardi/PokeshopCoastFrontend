'use client';
import { useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { selectSubtotal, useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/domain/money';
import { buttonClass } from '@/components/ui/Button';
import { useHydrated } from '@/hooks/useHydrated';
import Link from 'next/link';
import CartLine from './CartLine';

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const hydrated = useHydrated();
  const storedItems = useCartStore((s) => s.items);
  const storedSubtotal = useCartStore(selectSubtotal);
  // El carrito viene de localStorage: en SSR no existe. Hasta hidratar se pinta vacío.
  const items = hydrated ? storedItems : [];
  const subtotal = hydrated ? storedSubtotal : 0;
  const hasUnavailable = items.some((item) => item.in_stock === false);
  // En modo presentación PresentationGuard frena estos links (preventDefault):
  // ahí el carrito queda abierto y solo aparece el "Próximamente".
  const closeOnNavigate = (event) => {
    if (!event?.defaultPrevented) close();
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div onClick={close} className={`absolute inset-0 bg-coast-ink/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        role="dialog"
        aria-label="Carrito"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-uns-hairline px-6 py-5">
          <h2 className="font-display text-xl font-extrabold">Tu carrito</h2>
          <button type="button" onClick={close} aria-label="Cerrar carrito" className="rounded-full p-2 hover:bg-uns-stage">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag size={36} strokeWidth={1.4} className="text-coast-mist" />
            <p className="text-[14px] text-coast-gray">Tu carrito está vacío.</p>
            <Link href="/tienda" onClick={closeOnNavigate} className={buttonClass({ variant: 'dark' })}>
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-uns-hairline overflow-y-auto px-6">
              {items.map((item) => (
                <CartLine key={item.id} item={item} onNavigate={closeOnNavigate} />
              ))}
            </ul>
            <div className="space-y-4 border-t border-uns-hairline bg-white px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] uppercase tracking-[0.14em] text-coast-gray">Subtotal</span>
                <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[12px] text-coast-gray">Envío y recargos se calculan en el checkout.</p>
              <Link
                href="/checkout"
                onClick={closeOnNavigate}
                aria-disabled={hasUnavailable}
                className={buttonClass({ size: 'lg', block: true, className: hasUnavailable ? 'pointer-events-none opacity-50' : '' })}
              >
                Finalizar compra
              </Link>
              <Link href="/carrito" onClick={closeOnNavigate} className="block text-center text-[12px] font-semibold text-coast-gray underline-offset-4 hover:underline">
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
