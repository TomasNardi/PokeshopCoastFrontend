'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

export const PROMO_KEY = 'psc-promo-closed';
const HIDE_FOR_MS = 24 * 60 * 60 * 1000; // cerrado, no vuelve a aparecer ese día
const DELAY_MS = 1200; // no compite con la carga de la página

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

function rememberClosed(id) {
  try {
    window.localStorage.setItem(PROMO_KEY, JSON.stringify({ id, at: Date.now() }));
  } catch {
    /* sin storage: se cierra solo por esta visita */
  }
}

/**
 * Banner de promo (admin → Configuración → Banner): la ventanita con la
 * imagen exportada de Figma, como el popup de unsobremas. Opcionalmente con
 * título, texto y botón. Se cierra con la X, tocando afuera o con Escape.
 *
 * @param {{ banner: { id: string, image: string, title?: string, text?: string, button_label?: string, button_url?: string } | null }} props
 */
export default function PromoBanner({ banner }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
    closeRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function close() {
    rememberClosed(banner.id);
    setOpen(false);
  }

  const href = banner.button_url || '';
  const external = /^https?:\/\//.test(href);
  const LinkTag = external ? 'a' : Link;
  const linkProps = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };
  const hasText = banner.title || banner.text || (banner.button_label && href);
  const image = <img src={banner.image} alt={banner.title || 'Promoción'} className="promo-banner__image" />;

  return (
    <div className="promo-banner" role="dialog" aria-modal="true" aria-label={banner.title || 'Promoción'}>
      <button type="button" className="promo-banner__backdrop" aria-label="Cerrar" tabIndex={-1} onClick={close} />
      <div className="promo-banner__card">
        <button ref={closeRef} type="button" className="promo-banner__close" aria-label="Cerrar" onClick={close}>
          <X size={20} strokeWidth={2.4} />
        </button>
        {href ? (
          <LinkTag {...linkProps} onClick={close} className="block">
            {image}
          </LinkTag>
        ) : (
          image
        )}
        {hasText && (
          <div className="promo-banner__body">
            {banner.title && <p className="promo-banner__title">{banner.title}</p>}
            {banner.text && <p className="promo-banner__text">{banner.text}</p>}
            {banner.button_label && href && (
              <LinkTag {...linkProps} onClick={close} className="btn btn--dark promo-banner__button">
                {banner.button_label}
              </LinkTag>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
