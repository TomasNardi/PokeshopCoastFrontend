'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/** Debajo de esto la navegación se siente instantánea: no vale la pena mostrar la barra. */
const SHOW_DELAY_MS = 120;
const MAX_LOADING_MS = 15000;

const isModifiedClick = (event) => event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

/** ¿Este clic dispara una navegación interna de Next a otra URL? */
function isInternalNavigation(event) {
  if (event.defaultPrevented || isModifiedClick(event)) return false;
  const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return false;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  const here = window.location;
  // Mismo path y query = ancla (#nuevos-ingresos) o la misma página: no hay carga.
  return url.pathname !== here.pathname || url.search !== here.search;
}

/**
 * Barra fina arriba de todo mientras se carga otra página (como el
 * indicador del tema de unsobremas). Avanza "lento" hasta que la URL cambia
 * y ahí completa y se desvanece. Si la página llega rápido no aparece.
 */
function ProgressBar() {
  const pathname = usePathname();
  // El texto, no el objeto: la referencia puede cambiar sin que cambie la URL.
  const query = useSearchParams().toString();
  const [state, setState] = useState('idle'); // idle | loading | done
  const timer = useRef(0);

  useEffect(() => {
    const start = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState('loading'), SHOW_DELAY_MS);
    };
    const onClick = (event) => {
      if (isInternalNavigation(event)) start();
    };
    // Captura: se registra antes de que Next intercepte el clic del <Link>.
    document.addEventListener('click', onClick, true);
    // Filtros y buscador navegan con router.push: avisan con este evento.
    window.addEventListener('pokeshop:navigation-start', start);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('pokeshop:navigation-start', start);
      clearTimeout(timer.current);
    };
  }, []);

  // La URL cambió: la página nueva ya está (o está mostrando su esqueleto).
  useEffect(() => {
    clearTimeout(timer.current);
    setState((current) => (current === 'loading' ? 'done' : 'idle'));
  }, [pathname, query]);

  useEffect(() => {
    // done → se desvanece. loading → tope de seguridad por si la URL nunca
    // cambia (router.push a la misma dirección): la barra no queda colgada.
    if (state === 'idle') return undefined;
    const next = setTimeout(() => setState(state === 'done' ? 'idle' : 'done'), state === 'done' ? 400 : MAX_LOADING_MS);
    return () => clearTimeout(next);
  }, [state]);

  return <div className={`nav-progress is-${state}`} aria-hidden="true" />;
}

/** Para navegaciones por código (router.push): muestra la barra igual que un clic. */
export function signalNavigationStart() {
  window.dispatchEvent(new Event('pokeshop:navigation-start'));
}

export default function NavigationProgress() {
  // useSearchParams exige Suspense para no sacar del render estático al layout.
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
