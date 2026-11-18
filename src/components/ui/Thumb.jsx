'use client';
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Miniatura de producto (carrito, checkout, pedidos). Entra con un fundido al
 * cargar y, si la foto no existe o falla, queda un ícono neutro del mismo
 * tamaño en vez del texto alternativo roto encima del diseño.
 */
export default function Thumb({ src, alt = '', className = '' }) {
  const [state, setState] = useState(src ? 'loading' : 'error');

  if (state === 'error') {
    return (
      <span className={`flex items-center justify-center bg-uns-stage text-uns-border ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        <ImageOff size={18} strokeWidth={1.5} aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setState('loaded')}
      onError={() => setState('error')}
      ref={(img) => {
        // Si ya estaba en caché, onLoad puede dispararse antes de hidratar.
        if (img?.complete && state === 'loading') setState(img.naturalWidth > 0 ? 'loaded' : 'error');
      }}
      className={`transition-opacity duration-500 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
