'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, RefreshCcw, XCircle } from 'lucide-react';
import { getServices } from '@/services/container';
import Button from '@/components/ui/Button';
import { LoadingRegion, Skeleton } from '@/components/ui/Skeleton';

const NO_TOKEN = 'Este link no es válido o está incompleto. Probá con el botón del último mail que te mandamos.';

export function UnsubscribeSkeleton() {
  return (
    <LoadingRegion label="Procesando la baja" className="container-site flex flex-col items-center py-24">
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="mt-6 h-10 w-72 max-w-full sm:h-12" />
      <Skeleton className="mt-6 h-4 w-80 max-w-full" />
    </LoadingRegion>
  );
}

/**
 * Baja de mails comerciales (novedades y recordatorios de carrito). Se hace sola
 * al abrir el link del mail y muestra la confirmación; los mails de las compras
 * siguen llegando.
 */
export default function UnsubscribeResult() {
  const token = (useSearchParams().get('token') || '').trim();
  const [state, setState] = useState(token ? { status: 'loading' } : { status: 'error', message: NO_TOKEN });

  const run = useCallback(async () => {
    if (!token) return;
    setState({ status: 'loading' });
    try {
      const res = await getServices().engagement.unsubscribe(token);
      setState({ status: 'done', email: res?.email || '' });
    } catch (err) {
      setState({ status: 'error', message: err?.message || 'No pudimos procesar la baja. Probá de nuevo en un rato.' });
    }
  }, [token]);

  useEffect(() => { run(); }, [run]);

  if (state.status === 'loading') return <UnsubscribeSkeleton />;

  const done = state.status === 'done';
  const Icon = done ? CheckCircle2 : XCircle;

  return (
    <section className="container-site flex flex-col items-center py-24 text-center">
      <span className="result-pop">
        <Icon size={56} strokeWidth={1.5} className={done ? 'text-emerald-600' : 'text-coast-red'} />
      </span>
      <h1 className="result-rise mt-6 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
        {done ? 'Listo, te dimos de baja' : 'No pudimos validar el link'}
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-coast-gray" role="status">
        {done ? (
          <>
            {state.email ? <>No vamos a mandar más novedades ni recordatorios a <strong className="text-coast-ink">{state.email}</strong>. </> : 'Ya no vas a recibir novedades ni recordatorios por email. '}
            Los mails de tus compras siguen llegando con normalidad.
          </>
        ) : (
          state.message
        )}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {!done && token ? (
          <Button onClick={run} variant="outline" size="lg">
            <RefreshCcw size={14} /> Reintentar
          </Button>
        ) : null}
        <Button href="/tienda" size="lg">Volver a la tienda</Button>
      </div>
      <p className="mt-12 max-w-md border-t border-dashed border-coast-line pt-6 text-[13px] leading-relaxed text-uns-muted">
        ¿Fue sin querer? Podés volver a suscribirte desde el formulario de novedades en el inicio de la tienda.
      </p>
    </section>
  );
}
