'use client';
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { thumbOf } from '@/domain/images';

/**
 * Miniatura de producto (carrito, checkout, pedidos). Entra con un fundido al
 * cargar y, si la foto no existe o falla, queda un ícono neutro del mismo
 * tamaño en vez del texto alternativo roto encima del diseño.
 */
export default function Thumb({ src, alt = '', className = '' }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  // Siempre la versión chica del bucket (15 KB, no 300 KB). Si no existe, la original.
  const small = thumbOf(src);
  const [current, setCurrent] = useState(small);
  if (current !== small && current !== src) setCurrent(small);

  if (state === 'error') {
    return (
      <span className={`flex items-center justify-center bg-uns-stage text-uns-border ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        <ImageOff size={18} strokeWidth={1.5} aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setState('loaded')}
      onError={() => (current !== src ? setCurrent(src) : setState('error'))}
      ref={(img) => {
        // Si ya estaba en caché, onLoad puede dispararse antes de hidratar.
        if (img?.complete && state === 'loading') setState(img.naturalWidth > 0 ? 'loaded' : 'error');
      }}
      className={`transition-opacity duration-500 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
