'use client';
import { useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';

const MAX_TILT = 10; // grados
const PC_HOVER = '(hover: hover) and (pointer: fine) and (min-width: 750px)';

/**
 * Escenario del producto: fondo crema plano, la carta apoyada (sin sombra) y,
 * con mouse, la carta se inclina levemente en 3D siguiendo el puntero.
 * Las variables de tilt se escriben directo en el DOM (sin re-render).
 *
 * Los sellados y accesorios son fotos de producto, no cartas: en vez del tilt
 * llevan un zoom lento en hover (effect='zoom').
 *
 * size: 'card' (5:6, grillas) | 'detail' (cuadrado, ficha de producto)
 * effect: 'tilt' (cartas) | 'zoom' (sellados, accesorios)
 */
export default function ProductStage({ src, alt, size = 'card', effect = 'tilt', priority = false, className = '', children }) {
  const tilt = effect === 'tilt';
  const [state, setState] = useState(src ? 'loading' : 'empty');
  const [ratio, setRatio] = useState(null);
  const stageRef = useRef(null);
  const frame = useRef(0);

  const markLoaded = (img) => {
    if (img.naturalWidth > 0) setRatio(img.naturalWidth / img.naturalHeight);
    setState('loaded');
  };

  const onPointerMove = (e) => {
    // Solo PC: mouse y pantalla ancha (mismo corte que los hovers de globals.css).
    if (e.pointerType !== 'mouse' || !window.matchMedia(PC_HOVER).matches) return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.classList.add('is-tilting');
      el.style.setProperty('--ry', `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
    });
  };

  const onPointerLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={stageRef}
      className={`stage stage--${size} stage--${effect} ${className}`}
      onPointerMove={tilt ? onPointerMove : undefined}
      onPointerLeave={tilt ? onPointerLeave : undefined}
    >
      {src && state !== 'error' ? (
        <div className={`stage__float ${state === 'loaded' ? 'is-loaded' : ''}`}>
          <div className="stage__card" style={ratio ? { '--ar': ratio } : undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              onLoad={(e) => markLoaded(e.currentTarget)}
              onError={() => setState('error')}
              ref={(img) => {
                // Si la imagen ya estaba en caché, onLoad no dispara antes de hidratar.
                if (img?.complete && img.naturalWidth > 0 && state === 'loading') markLoaded(img);
              }}
              className="stage__img"
            />
          </div>
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
