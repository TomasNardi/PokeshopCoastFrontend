'use client';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { getMaxQuantity } from '@/domain/product';
import AddToCartButton from './AddToCartButton';

/** Selector de cantidad + agregar. Solo muestra el selector si hay más de una unidad. */
export default function ProductPurchase({ product }) {
  const max = getMaxQuantity(product);
  const [qty, setQty] = useState(1);
  const canChoose = max > 1;

  return (
    <div className="flex gap-3">
      {canChoose && (
        <div className="flex items-center border border-coast-line bg-white">
          <button type="button" className="px-4 py-4 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)} aria-label="Restar uno">
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button type="button" className="px-4 py-4 disabled:opacity-30" disabled={qty >= max} onClick={() => setQty((q) => q + 1)} aria-label="Sumar uno">
            <Plus size={14} />
          </button>
        </div>
      )}
      <div className="flex-1">
        <AddToCartButton product={product} quantity={qty} disabled={max === 0} />
      </div>
    </div>
  );
}
