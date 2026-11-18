'use client';
import { startTransition, useCallback, useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';

/** Espera entre reintentos: arranca rápido y se estabiliza en 30 s. */
export const RETRY_DELAYS_MS = [2000, 4000, 8000, 15000, 30000];
/** Pasado este tiempo sin suerte, se avisa que está tardando. */
export const SLOW_NOTICE_MS = 10000;
/** Si pasó más que esto desde el último intento, se arranca de cero. */
const STREAK_RESET_MS = 60000;

// Fuera del componente: el error boundary lo vuelve a montar en cada intento
// fallido, y la espera y el "desde cuándo falla" tienen que seguir corriendo.
let streak = 0;
let lastAttemptAt = 0;
let failingSince = 0;
// Con varias secciones fallando a la vez se muestra un solo aviso.
let noticeOwner = null;

function startStreakIfStale() {
  const now = Date.now();
  if (now - lastAttemptAt > STREAK_RESET_MS) {
    streak = 0;
    failingSince = now;
  }
  lastAttemptAt = now;
}

function nextDelay() {
  startStreakIfStale();
  const delay = RETRY_DELAYS_MS[Math.min(streak, RETRY_DELAYS_MS.length - 1)];
  streak += 1;
  return delay;
}

function SlowNotice({ onRetry }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" aria-live="polite">
      <div className="flex items-center gap-4 rounded-full bg-black px-5 py-3 text-[13px] text-white shadow-lg">
        <span>Está tardando más de lo normal. Seguimos intentando…</span>
        <button type="button" onClick={onRetry} className="font-bold uppercase tracking-[0.1em] underline underline-offset-4">
          Reintentar
        </button>
      </div>
    </div>
  );
}

/**
 * Si el backend no responde, la página nunca se ve rota: queda el esqueleto
 * (children) y se reintenta sola en segundo plano. Si en 10 s no volvió,
 * aparece un aviso discreto con "Reintentar". Cuando el backend vuelve, el
 * contenido real reemplaza al esqueleto sin que nadie toque nada.
 *
 * `reset` es el del error boundary de Next; sin él solo se refresca la ruta
 * (secciones que fallaron dentro de una página que sí cargó).
 */
export default function KeepLoading({ children, reset }) {
  const router = useRouter();
  const id = useId();
  const [slow, setSlow] = useState(false);

  const retry = useCallback(() => {
    startTransition(() => {
      router.refresh();
      reset?.();
    });
  }, [router, reset]);

  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        // Pestaña en segundo plano: no se gasta backend, se reintenta al volver.
        if (document.visibilityState === 'visible') retry();
        schedule();
      }, nextDelay());
    };
    schedule();
    return () => clearTimeout(timer);
  }, [retry]);

  useEffect(() => {
    const check = () => {
      if (noticeOwner === null) noticeOwner = id;
      setSlow(noticeOwner === id && Date.now() - failingSince >= SLOW_NOTICE_MS);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => {
      clearInterval(interval);
      if (noticeOwner === id) noticeOwner = null;
    };
  }, [id]);

  return (
    <>
      {children}
      {slow && <SlowNotice onRetry={retry} />}
    </>
  );
}
