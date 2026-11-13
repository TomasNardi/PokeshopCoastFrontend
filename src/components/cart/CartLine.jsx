'use client';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/domain/money';
import { getMaxQuantity } from '@/domain/product';
import { useCartStore } from '@/store/cartStore';

export default function CartLine({ item, onNavigate }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const max = getMaxQuantity(item);
  const unavailable = max === 0;

  return (
    <li className="flex gap-4 py-4">
      <Link href={`/tienda/${item.slug}`} onClick={onNavigate} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-coast-line bg-white">
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="h-full w-full object-contain p-2" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/tienda/${item.slug}`} onClick={onNavigate} className="line-clamp-2 text-[13px] font-semibold text-coast-ink hover:text-coast-red">
            {item.name}
          </Link>
          <button type="button" onClick={() => remove(item.id)} aria-label={`Quitar ${item.name}`} className="text-coast-mist hover:text-coast-red">
            <Trash2 size={15} />
          </button>
        </div>
        {item.category && <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-coast-mist">{item.category}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          {unavailable ? (
            <span className="text-[12px] font-semibold text-coast-red-dark">Sin stock — quitalo para continuar</span>
          ) : (
            <div className="flex items-center border border-coast-line bg-white">
              <button type="button" className="px-2.5 py-1.5 disabled:opacity-30" onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label="Restar uno">
                <Minus size={12} />
              </button>
              <span className="w-7 text-center text-[13px] font-semibold" aria-live="polite">{item.quantity}</span>
              <button type="button" className="px-2.5 py-1.5 disabled:opacity-30" disabled={item.quantity >= max} onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label="Sumar uno">
                <Plus size={12} />
              </button>
            </div>
          )}
          <span className="text-[14px] font-bold">{formatPrice(Number(item.final_price) * item.quantity)}</span>
        </div>
      </div>
    </li>
  );
}
