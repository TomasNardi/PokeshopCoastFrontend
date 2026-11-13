'use client';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Escenario del producto (estilo unsobremas): fondo #F2F2F2, el producto
 * flotando arriba del centro y la sombra elíptica separada abajo.
 * En unsobremas el gris y la sombra vienen "horneados" en cada foto; acá se
 * arma con CSS para que sirva cualquier imagen del servicio de carga.
 *
 * size: 'card' (5:6, grillas) | 'detail' (cuadrado, ficha de producto)
 */
export default function ProductStage({ src, alt, size = 'card', priority = false, className = '', children }) {
  const [state, setState] = useState(src ? 'loading' : 'empty');

  return (
    <div className={`stage stage--${size} ${className}`}>
      {src && state !== 'error' ? (
        <div className={`stage__float ${state === 'loaded' ? 'is-loaded' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onLoad={() => setState('loaded')}
            onError={() => setState('error')}
            ref={(img) => {
              // Si la imagen ya estaba en caché, onLoad no dispara antes de hidratar.
              if (img?.complete && img.naturalWidth > 0 && state === 'loading') setState('loaded');
            }}
            className="stage__img"
          />
          <span className="stage__shadow" aria-hidden="true" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-uns-border">
          <ImageOff size={28} strokeWidth={1.5} />
        </div>
      )}
      {children}
    </div>
  );
}
