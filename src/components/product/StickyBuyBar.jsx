'use client';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/domain/money';
import { getMaxQuantity } from '@/domain/product';
import AddToCartButton from './AddToCartButton';

/**
 * Barra de compra fija abajo (como unsobremas): aparece cuando el botón de
 * compra de la ficha sale de la pantalla y se va cuando vuelve. Nombre, precio
 * y "Agregar al carrito" siempre a mano mientras mirás fotos o sugeridos.
 */
export default function StickyBuyBar({ product, price, anchorId = 'buy-anchor' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor || typeof IntersectionObserver === 'undefined') return undefined;
    // Visible solo cuando el botón quedó ARRIBA (ya lo pasaste), no antes de llegar.
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorId]);

  useEffect(() => {
    document.documentElement.classList.toggle('has-buy-bar', visible);
    return () => document.documentElement.classList.remove('has-buy-bar');
  }, [visible]);

  if (getMaxQuantity(product) === 0) return null;

  return (
    <div className={`buy-bar ${visible ? 'is-visible' : ''}`} aria-hidden={!visible} inert={!visible}>
      <div className="container-site flex items-center gap-4">
        <p className="min-w-0 flex-1 truncate text-[12px] font-bold uppercase tracking-[0.04em]">
          <span className="hidden sm:inline">{product.name} · </span>
          <span className="text-coast-ink">{formatPrice(price)}</span>
        </p>
        <div className="buy-bar__cta w-[260px] max-w-[62%] shrink-0">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
