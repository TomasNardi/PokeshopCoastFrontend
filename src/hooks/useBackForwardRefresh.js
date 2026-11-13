'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * EL fix de "volver atrás" en Vercel (mismo que Crack, commit afbf4b0).
 *
 * Problema: al volver con el botón atrás (por ejemplo desde Mercado Pago, o
 * después de comprar) el navegador restaura la página desde el bfcache o el
 * router de Next reusa el payload RSC viejo → stock, precios y carrito
 * desactualizados, o directamente una página "congelada" que no responde.
 *
 * Solución: si la carga fue un back/forward, o la página vuelve del bfcache
 * (`pageshow` con `persisted`), se fuerza router.refresh(): vuelve a pedir los
 * Server Components sin perder el estado del cliente (carrito, scroll).
 *
 * Se monta UNA vez en el layout raíz (<BackForwardRefresh />), no por página.
 */
export function isBackForwardNavigation(perf = globalThis.performance) {
  if (typeof perf?.getEntriesByType !== 'function') return false;
  return perf.getEntriesByType('navigation')[0]?.type === 'back_forward';
}

export function useBackForwardRefresh() {
  const router = useRouter();

  useEffect(() => {
    if (isBackForwardNavigation()) router.refresh();

    const handlePageShow = (event) => {
      if (event.persisted) router.refresh();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [router]);
}
