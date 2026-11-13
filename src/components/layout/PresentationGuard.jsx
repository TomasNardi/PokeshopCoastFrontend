'use client';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const SOON_MESSAGE = 'Próximamente';

/**
 * ¿Este link sale de la home dentro del sitio? Externos (redes, WhatsApp),
 * anclas de la propia home ("#...", "/#...") y la home misma quedan habilitados.
 */
export function isBlockedHref(anchor, origin = window.location.origin) {
  const raw = anchor.getAttribute('href');
  if (!raw || raw.startsWith('#') || anchor.target === '_blank') return false;
  let url;
  try {
    url = new URL(raw, origin);
  } catch {
    return false;
  }
  if (url.origin !== origin) return false;
  return url.pathname !== '/' || url.search !== '';
}

/**
 * Modo presentación (src/config/presentation.js): el header y los menús funcionan
 * (se abren, animan, etc.) pero ningún link lleva a otra sección: muestra
 * "Próximamente". Un solo listener en fase de captura de window corre antes
 * que los handlers de React y de next/link, que respetan defaultPrevented.
 * El middleware sigue como red de seguridad si alguien escribe la URL a mano.
 */
export default function PresentationGuard() {
  useEffect(() => {
    const soon = () => toast(SOON_MESSAGE, { id: 'presentation-soon', duration: 1800 });

    const onClick = (event) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!anchor || !isBlockedHref(anchor)) return;
      // Sin stopPropagation: el onClick de React igual corre (cierra el drawer/megamenú),
      // pero next/link ve defaultPrevented y no navega.
      event.preventDefault();
      soon();
    };

    // La búsqueda navega con router.push desde onSubmit: se corta antes de que React la vea.
    const onSubmit = (event) => {
      if (!(event.target instanceof HTMLFormElement) || event.target.getAttribute('role') !== 'search') return;
      event.preventDefault();
      event.stopPropagation();
      soon();
    };

    window.addEventListener('click', onClick, true);
    window.addEventListener('submit', onSubmit, true);
    return () => {
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('submit', onSubmit, true);
    };
  }, []);

  return null;
}
