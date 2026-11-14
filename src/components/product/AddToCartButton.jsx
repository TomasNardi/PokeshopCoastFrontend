'use client';
import { useEffect, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { buttonClass } from '@/components/ui/Button';

/**
 * Tiempos del quick add (como unsobremas): el texto se va y un anillo se llena
 * (LOADING), aparece el check y se abre el carrito (OPEN), y el botón vuelve a
 * su estado normal (RESET).
 */
const QUICK_ADD_MS = { LOADING: 600, OPEN: 850, RESET: 1700 };

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Recibe el producto CRUDO de la API (el carrito guarda su propia línea).
 * variant 'icon' → quick add de la card, como unsobremas (ver .quick-add-btn en
 * globals.css): en PC barra roja "Agregar al carrito" que sube con el hover;
 * en táctil, botón blanco de 36px con la bolsa, siempre visible. Al tocarlo:
 * anillo de carga → check → se abre el carrito.
 * 'full' → ficha.
 */
export default function AddToCartButton({ product, quantity = 1, variant = 'full', disabled = false }) {
  const add = useCartStore((s) => s.add);
  const open = useCartStore((s) => s.open);
  const [status, setStatus] = useState('idle'); // idle | loading | added
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const failMessage = () => (product.in_stock === false ? 'Sin stock' : 'Ya tenés el máximo disponible en el carrito');

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (variant !== 'icon' || prefersReducedMotion()) {
      if (add(product, quantity)) open();
      else toast.error(failMessage());
      return;
    }
    if (status !== 'idle') return;
    setStatus('loading');
    later(() => {
      if (!add(product, quantity)) {
        setStatus('idle');
        toast.error(failMessage());
        return;
      }
      setStatus('added');
      later(open, QUICK_ADD_MS.OPEN - QUICK_ADD_MS.LOADING);
      later(() => setStatus('idle'), QUICK_ADD_MS.RESET - QUICK_ADD_MS.LOADING);
    }, QUICK_ADD_MS.LOADING);
  };

  if (variant === 'icon') {
    const stateClass = status === 'idle' ? '' : `is-${status}`;
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Agregar ${product.name} al carrito`}
        aria-busy={status === 'loading'}
        className={`quick-add-btn ${stateClass}`}
      >
        <span className="quick-add-btn__text">Agregar al carrito</span>
        <ShoppingBag className="quick-add-btn__icon" size={22} strokeWidth={2} aria-hidden="true" />
        <svg className="quick-add-btn__loader" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="7" />
          <circle cx="9" cy="9" r="7" pathLength="88" />
        </svg>
        <svg className="quick-add-btn__added" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2.5 8.5l3.5 3.5 7.5-8" />
        </svg>
        <span className="sr-only" aria-live="polite">
          {status === 'added' ? 'Agregado al carrito' : ''}
        </span>
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
