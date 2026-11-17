'use client';
import { useState } from 'react';
import ProductStage from './ProductStage';
import ProductLightbox from './ProductLightbox';

/**
 * Galería de la ficha: imagen grande en el escenario + miniaturas debajo.
 * Click en la imagen grande abre el visor a pantalla completa.
 * Con una sola imagen se ve igual que antes (sin miniaturas).
 */
export default function ProductGallery({ images, alt, effect, children }) {
  const [active, setActive] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const current = images[active] || images[0] || null;

  return (
    <div>
      {/* key: al cambiar de foto se remonta el escenario y vuelve a animar la carga. */}
      <ProductStage key={current} src={current} alt={alt} size="detail" effect={effect} priority={active === 0}>
        {current && (
          // Capa transparente encima de la foto: abre el visor sin cortar el tilt
          // (los eventos del puntero siguen llegando al escenario).
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            aria-label="Ampliar foto"
            className="absolute inset-0 z-[5] cursor-zoom-in"
          />
        )}
        {children}
      </ProductStage>

      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1} de ${images.length}`}
                aria-current={i === active ? 'true' : undefined}
                className={`flex aspect-square w-full items-center justify-center bg-uns-stage p-2 transition-opacity ${
                  i === active ? 'outline outline-2 outline-offset-[-2px] outline-coast-ink' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewerOpen && (
        <ProductLightbox
          images={images}
          index={active}
          alt={alt}
          onIndexChange={setActive}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}
