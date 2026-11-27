'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

export const PROMO_KEY = 'psc-promo-closed';
const HIDE_FOR_MS = 24 * 60 * 60 * 1000; // cerrado, no vuelve a aparecer ese día
const DELAY_MS = 3000; // como unsobremas: aparece a los 3 s

// Donde el cliente está comprando o haciendo un trámite, no se lo interrumpe.
const QUIET_PATHS = ['/checkout', '/carrito', '/cuenta', '/arrepentimiento', '/desuscribirse', '/acceso-desarrollo', '/vista-previa'];

export function isQuietPath(pathname = '') {
  return QUIET_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function wasClosedRecently(id, now = Date.now()) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PROMO_KEY) || 'null');
    return Boolean(saved && saved.id === id && now - saved.at < HIDE_FOR_MS);
  } catch {
    return false;
  }
}

/** Encuadre del admin → variables CSS (--pb-m* celular, --pb-d* compu). Valores fuera de rango vuelven al centro. */
export function framingStyle(framing) {
  const num = (value, fallback, low, high) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, low), high) : fallback;
  };
  const style = {};
  [['m', framing?.mobile], ['d', framing?.desktop]].forEach(([key, view]) => {
    style[`--pb-${key}x`] = `${num(view?.x, 50, 0, 100)}%`;
    style[`--pb-${key}y`] = `${num(view?.y, 50, 0, 100)}%`;
    style[`--pb-${key}z`] = num(view?.zoom, 1, 1, 3);
  });
  return style;
}

function rememberClosed(id) {
  try {
    window.localStorage.setItem(PROMO_KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {
    /* sin storage: se cierra solo por esta visita */
  }
}

/**
 * Banner de promo (admin → Configuración → Banner): la ventanita con la
 * imagen exportada de Figma, calcado del popup de unsobremas (bp-popup):
 * desktop 760px con la imagen a la izquierda (40%) y el texto sobre #111;
 * mobile 320px con la imagen arriba (5:2). Aparece a los 3 s, una vez por día.
 * Se cierra con la X, tocando afuera o con Escape.
 *
 * La imagen respeta el encuadre del admin (posición y zoom por separado para
 * celular y compu): object-position + scale con el mismo origen, igual que
 * la vista previa del admin (static/admin/js/promo_banner_framing.js).
 *
 * @param {{ banner: { id: string, image: string, framing?: { mobile?: { x: number, y: number, zoom: number }, desktop?: { x: number, y: number, zoom: number } }, eyebrow?: string, title?: string, text?: string, button_label?: string, button_url?: string } | null }} props
 */
export default function PromoBanner({ banner }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // un cuadro después de montar: dispara la animación
  const closeRef = useRef(null);

  useEffect(() => {
    if (!banner?.image || isQuietPath(pathname) || wasClosedRecently(banner.id)) return undefined;
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
    // Solo al llegar: navegar dentro de la tienda no lo vuelve a abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner?.id]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = requestAnimationFrame(() => setShown(true));
    document.documentElement.classList.add('promo-banner-lock');
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event) => event.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove('promo-banner-lock');
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function close() {
    rememberClosed(banner.id);
    setShown(false);
    setOpen(false);
  }

  const href = banner.button_url || '';
  const external = /^https?:\/\//.test(href);
  const LinkTag = external ? 'a' : Link;
  const linkProps = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };
  const image = <img src={banner.image} alt={banner.title || 'Promoción'} />;
  const hasContent = banner.eyebrow || banner.title || banner.text || (banner.button_label && href);

  return (
    <div
      className={`promo-banner${shown ? ' is-open' : ''}${hasContent ? '' : ' promo-banner--image-only'}`}
      role="dialog"
      aria-modal="true"
      aria-label={banner.title || 'Promoción'}
    >
      <div className="promo-banner__overlay" aria-hidden="true" onClick={close} />
      <div className="promo-banner__dialog">
        <button ref={closeRef} type="button" className="promo-banner__close" aria-label="Cerrar" onClick={close}>
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div className="promo-banner__media" style={framingStyle(banner.framing)}>
          {href ? (
            <LinkTag {...linkProps} onClick={close} tabIndex={-1}>
              {image}
            </LinkTag>
          ) : (
            image
          )}
        </div>
        {hasContent && (
          <div className="promo-banner__content">
            {banner.eyebrow && (
              <p className="promo-banner__block promo-banner__pretitle" style={{ '--i': 1 }}>{banner.eyebrow}</p>
            )}
            {banner.title && (
              <h2 className="promo-banner__block promo-banner__heading" style={{ '--i': 2 }}>{banner.title}</h2>
            )}
            {banner.text && <p className="promo-banner__block promo-banner__text" style={{ '--i': 3 }}>{banner.text}</p>}
            {banner.button_label && href && (
              <div className="promo-banner__block promo-banner__action" style={{ '--i': 4 }}>
                <LinkTag {...linkProps} onClick={close} className="promo-banner__button">
                  {banner.button_label}
                </LinkTag>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
