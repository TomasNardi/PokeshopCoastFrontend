'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { thumbOf } from '@/domain/images';

const ZOOM = 2.5;
const SWIPE = 50; // px para cambiar de foto
const SWIPE_CLOSE = 90; // px hacia abajo para cerrar (mobile)
const ANIM_MS = 250;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/**
 * Visor a pantalla completa de las fotos del producto (estilo PhotoSwipe):
 * fondo blanco, la foto centrada, flechas + teclado, contador y miniaturas.
 * - Click / tap en la foto: zoom. En PC el zoom sigue al mouse; en mobile
 *   se arrastra con el dedo.
 * - Mobile sin zoom: swipe a los costados cambia de foto, hacia abajo cierra.
 * - Escape cierra.
 */
export default function ProductLightbox({ images, index, alt, onIndexChange, onClose }) {
  const [visible, setVisible] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const touch = useRef(null);
  const swiped = useRef(false);
  const imgRef = useRef(null);
  const closing = useRef(false);
  const count = images.length;

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setVisible(false);
    setTimeout(onClose, ANIM_MS);
  }, [onClose]);

  const go = useCallback(
    (step) => {
      if (count < 2) return;
      setZoomed(false);
      onIndexChange((index + step + count) % count);
    },
    [count, index, onIndexChange],
  );

  // Entrada animada + bloqueo del scroll de la página + teclado.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close, go]);

  const pointToOrigin = (clientX, clientY) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const toggleZoom = (e) => {
    if (zoomed) return setZoomed(false);
    setOrigin(pointToOrigin(e.clientX, e.clientY));
    setZoomed(true);
  };

  // PC: con zoom, la foto sigue al mouse.
  const onMouseMove = (e) => {
    if (zoomed && e.pointerType === 'mouse') setOrigin(pointToOrigin(e.clientX, e.clientY));
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    touch.current = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false };
  };

  const onPointerMove = (e) => {
    onMouseMove(e);
    const t = touch.current;
    if (!t || e.pointerType === 'mouse') return;
    if (Math.abs(e.clientX - t.x) > 6 || Math.abs(e.clientY - t.y) > 6) t.moved = true;
    if (zoomed) {
      // Mobile con zoom: arrastrar mueve la foto (el origen va al revés del dedo).
      const rect = imgRef.current?.getBoundingClientRect();
      if (rect) {
        setOrigin((o) => ({
          x: clamp(o.x - ((e.clientX - t.lastX) / rect.width) * 100, 0, 100),
          y: clamp(o.y - ((e.clientY - t.lastY) / rect.height) * 100, 0, 100),
        }));
      }
    } else {
      setDrag({ x: e.clientX - t.x, y: Math.max(0, e.clientY - t.y) });
    }
    t.lastX = e.clientX;
    t.lastY = e.clientY;
  };

  const onPointerUp = (e) => {
    const t = touch.current;
    touch.current = null;
    swiped.current = Boolean(t?.moved);
    setDrag({ x: 0, y: 0 });
    if (!t || e.pointerType === 'mouse' || zoomed) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (dy > SWIPE_CLOSE && Math.abs(dx) < dy) close();
    else if (dx <= -SWIPE) go(1);
    else if (dx >= SWIPE) go(-1);
  };

  const onImageClick = (e) => {
    e.stopPropagation();
    // En mobile, si fue un swipe no hacemos zoom.
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    toggleZoom(e);
  };

  const dragging = drag.x !== 0 || drag.y !== 0;
  const fade = dragging ? Math.max(0.4, 1 - drag.y / 400) : 1;
  const current = images[index];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${alt}`}
      className="fixed inset-0 z-[100] flex flex-col bg-white transition-opacity ease-out"
      style={{ transitionDuration: `${ANIM_MS}ms`, opacity: visible ? fade : 0 }}
    >
      {/* Barra superior */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-coast-gray">
          {count > 1 ? `${index + 1} / ${count}` : ''}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="flex h-11 w-11 items-center justify-center border border-coast-line bg-white transition-colors hover:border-coast-ink"
        >
          <X size={18} />
        </button>
      </div>

      {/* Foto */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 sm:px-20"
        onClick={() => zoomed && setZoomed(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          touch.current = null;
          setDrag({ x: 0, y: 0 });
        }}
        style={{ touchAction: 'none' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current}
          ref={imgRef}
          src={current}
          alt={alt}
          draggable={false}
          onClick={onImageClick}
          className={`max-h-full max-w-full select-none object-contain ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'} ${
            dragging ? '' : 'transition-transform duration-300 ease-out'
          }`}
          style={{
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transform: zoomed
              ? `scale(${ZOOM})`
              : `translate(${drag.x}px, ${drag.y}px) scale(${visible ? 1 : 0.94})`,
          }}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              aria-label="Foto anterior"
              className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-coast-line bg-white transition-colors hover:border-coast-ink sm:flex"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(1); }}
              aria-label="Foto siguiente"
              className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-coast-line bg-white transition-colors hover:border-coast-ink sm:flex"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {count > 1 && (
        <ul className="flex justify-center gap-2 overflow-x-auto px-4 py-4 sm:gap-3 sm:py-6">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => { setZoomed(false); onIndexChange(i); }}
                aria-label={`Ver foto ${i + 1} de ${count}`}
                aria-current={i === index ? 'true' : undefined}
                className={`flex h-14 w-14 items-center justify-center bg-uns-stage p-1.5 transition-opacity sm:h-16 sm:w-16 ${
                  i === index ? 'outline outline-2 outline-offset-[-2px] outline-coast-ink' : 'opacity-50 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbOf(src)} onError={(e) => { if (e.currentTarget.src !== src) e.currentTarget.src = src; }} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body,
  );
}
