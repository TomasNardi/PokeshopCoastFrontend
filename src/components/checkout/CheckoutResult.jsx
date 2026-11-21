'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, PackageSearch, XCircle } from 'lucide-react';
import { useSession } from '@/components/auth/SessionProvider';
import { SIGNUP_HREF, readGuestEmail } from '@/domain/guestSignup';
import { getServices } from '@/services/container';
import { useCartStore } from '@/store/cartStore';
import Button from '@/components/ui/Button';
import { whatsappLink } from '@/config/site';
import { LoadingRegion, Skeleton, SkeletonText } from '@/components/ui/Skeleton';

const VARIANTS = {
  success: { icon: CheckCircle2, tone: 'text-emerald-600', title: '¡Gracias por tu compra!', clearsCart: true },
  pending: { icon: Clock, tone: 'text-amber-500', title: 'Tu pago está pendiente', clearsCart: true },
  error: { icon: XCircle, tone: 'text-coast-red', title: 'No pudimos procesar el pago', clearsCart: false },
};

/**
 * Página de vuelta de Mercado Pago (back_urls) o de la transferencia.
 * Si viene de MP con payment_id, se verifica contra el backend: la URL la
 * puede tocar cualquiera, el estado real lo dice el servidor.
 */
/** Mismo bloque centrado que CheckoutResult mientras se leen los parámetros. */
export function CheckoutResultSkeleton() {
  return (
    <LoadingRegion label="Cargando" className="container-site flex flex-col items-center py-24">
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="mt-6 h-10 w-72 max-w-full sm:h-12" />
      <Skeleton className="mt-6 h-4 w-80 max-w-full" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      <div className="mt-10 flex gap-3">
        <Skeleton className="h-[52px] w-44" />
        <Skeleton className="h-[52px] w-52" />
      </div>
    </LoadingRegion>
  );
}

export default function CheckoutResult({ variant }) {
  const params = useSearchParams();
  const clear = useCartStore((s) => s.clear);
  const [order, setOrder] = useState(null);
  const [verifying, setVerifying] = useState(Boolean(params.get('payment_id')));
  const cfg = VARIANTS[variant];
  const isTransfer = params.get('transfer') === '1';
  const Icon = cfg.icon;
  const { status } = useSession();
  const [guestEmail, setGuestEmail] = useState('');
  useEffect(() => setGuestEmail(readGuestEmail()), []);
  const offerAccount = variant !== 'error' && status === 'anonymous' && guestEmail;

  useEffect(() => {
    if (cfg.clearsCart) clear();
    const paymentId = params.get('payment_id');
    if (paymentId) {
      getServices()
        .orders.verifyPayment({
          payment_id: paymentId,
          status: params.get('status'),
          external_reference: params.get('external_reference'),
          preference_id: params.get('preference_id'),
        })
        .then((res) => setOrder(res?.order || null))
        .catch(() => {})
        .finally(() => setVerifying(false));
    } else if (params.get('code')) {
      setOrder({ order_code: params.get('code') });
    }
  }, [params, clear, cfg.clearsCart]);

  return (
    <section className="container-site flex flex-col items-center py-24 text-center">
      <span className="result-pop"><Icon size={56} strokeWidth={1.5} className={cfg.tone} /></span>
      <h1 className="result-rise mt-6 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{cfg.title}</h1>
      {verifying && (
        <p className="mt-4 text-coast-gray" role="status">
          <span className="sr-only">Verificando el pago…</span>
          <SkeletonText width="160px" />
        </p>
      )}
      {!verifying && order?.order_code && (
        <p className="mt-4 text-coast-gray">
          Pedido <strong className="text-coast-ink">{order.order_code}</strong>
        </p>
      )}
      <p className="mt-4 max-w-md text-[15px] text-coast-gray">
        {variant === 'success' && (isTransfer
          ? 'Recibimos tu comprobante. Confirmamos la transferencia y te avisamos por email.'
          : 'Te mandamos el detalle por email. Cuando despachemos el pedido te llega el seguimiento.')}
        {variant === 'pending' && 'Mercado Pago está procesando el pago. Te avisamos por email apenas se acredite.'}
        {variant === 'error' && 'No se realizó ningún cobro. Tu carrito sigue guardado para que vuelvas a intentar.'}
      </p>
      {offerAccount && (
        <div className="result-rise mt-8 w-full max-w-md border border-coast-line bg-uns-stage p-5 text-left [animation-delay:.25s]">
          <p className="flex items-center gap-2 text-[14px] font-bold"><PackageSearch size={18} /> Seguí tu pedido desde tu cuenta</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-uns-muted">
            Creá tu cuenta con <strong className="break-all text-coast-ink">{guestEmail}</strong> y este pedido aparece solo en
            Mi cuenta, con su estado y el seguimiento del envío. Es opcional.
          </p>
          <Button href={SIGNUP_HREF} size="sm" className="mt-4">Crear mi cuenta</Button>
        </div>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {variant === 'error' ? <Button href="/checkout" size="lg">Reintentar pago</Button> : <Button href="/tienda" size="lg">Seguir comprando</Button>}
        <Button href={whatsappLink(`¡Hola, PokeShop Coast! 👋 Tengo una consulta por mi pedido ${order?.order_code || ''}`.trim())} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">
          Consultar por WhatsApp
        </Button>
      </div>
    </section>
  );
}
