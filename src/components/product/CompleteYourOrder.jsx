'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, toNumber } from '@/domain/money';
import Thumb from '@/components/ui/Thumb';

/**
 * "Completá tu pedido": accesorios al lado del botón de compra, de a uno por
 * vista, deslizables, con un "+" que los suma al carrito sin salir de la ficha
 * (como unsobremas). Los puntos marcan en cuál estás.
 */
export default function CompleteYourOrder({ products = [] }) {
  const add = useCartStore((s) => s.add);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const onScroll = () => setActive(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  if (!products.length) return null;

  const go = (index) => trackRef.current?.scrollTo({ left: index * trackRef.current.clientWidth, behavior: 'smooth' });

  const quickAdd = (product) => {
    if (!add(product, 1)) {
      toast.error('Ya tenés el máximo disponible en el carrito');
      return;
    }
    setAdded(product.id);
    toast.success(`${product.name} sumado al carrito`);
    setTimeout(() => setAdded((id) => (id === product.id ? null : id)), 1600);
  };

  return (
    <section aria-label="Completá tu pedido" className="border-t border-coast-line pt-5">
      <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em]">Completá tu pedido</p>
      <div ref={trackRef} className="complete-track">
        {products.map((product) => {
          const price = toNumber(product.final_price, toNumber(product.price_ars));
          const isAdded = added === product.id;
          return (
            <article key={product.id} className="complete-item">
              <Link href={`/tienda/${product.slug}`} className="shrink-0">
                <Thumb src={product.image_url_thumb || product.image_url} alt="" className="h-[84px] w-[72px] bg-uns-stage object-contain p-1.5" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/tienda/${product.slug}`} className="line-clamp-2 text-[12px] font-bold uppercase leading-snug tracking-[0.03em] hover:underline">
                  {product.name}
                </Link>
                <p className="mt-1 text-[12px] font-semibold text-coast-gray">{formatPrice(price)}</p>
              </div>
              <button
                type="button"
                onClick={() => quickAdd(product)}
                className={`complete-add ${isAdded ? 'is-added' : ''}`}
                aria-label={`Sumar ${product.name} al carrito`}
              >
                {isAdded ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
              </button>
            </article>
          );
        })}
      </div>
      {products.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Accesorios">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Ver ${index + 1} de ${products.length}`}
              onClick={() => go(index)}
              className={`h-[3px] w-7 rounded-full transition-colors ${index === active ? 'bg-coast-ink' : 'bg-coast-line'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
