'use client';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { buttonClass } from '@/components/ui/Button';

/**
 * Recibe el producto CRUDO de la API (el carrito guarda su propia línea).
 * variant 'icon' → quick add de la card (negro, como el tema); 'full' → ficha.
 */
export default function AddToCartButton({ product, quantity = 1, variant = 'full', disabled = false }) {
  const add = useCartStore((s) => s.add);
  const open = useCartStore((s) => s.open);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (add(product, quantity)) {
      open();
    } else {
      toast.error(product.in_stock === false ? 'Sin stock' : 'Ya tenés el máximo disponible en el carrito');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Agregar ${product.name} al carrito`}
        className="flex h-11 w-11 items-center justify-center bg-black text-white transition-colors duration-300 hover:bg-coast-red disabled:bg-uns-border"
      >
        <ShoppingBag size={17} strokeWidth={2} />
      </button>
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled} className={buttonClass({ variant: 'dark', size: 'lg', block: true })}>
      <ShoppingBag size={15} strokeWidth={2} />
      {disabled ? 'Sin stock' : 'Agregar al carrito'}
    </button>
  );
}
