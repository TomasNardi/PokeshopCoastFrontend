'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getServices } from '@/services/container';
import { useCartStore } from '@/store/cartStore';
import Button from '@/components/ui/Button';
import { whatsappLink } from '@/config/site';

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
export default function CheckoutResult({ variant }) {
  const params = useSearchParams();
  const clear = useCartStore((s) => s.clear);
  const [order, setOrder] = useState(null);
  const cfg = VARIANTS[variant];
  const isTransfer = params.get('transfer') === '1';
  const Icon = cfg.icon;

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
        .catch(() => {});
    } else if (params.get('code')) {
      setOrder({ order_code: params.get('code') });
    }
  }, [params, clear, cfg.clearsCart]);

  return (
    <section className="container-site flex flex-col items-center py-24 text-center">
      <Icon size={56} strokeWidth={1.5} className={cfg.tone} />
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{cfg.title}</h1>
      {order?.order_code && (
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
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {variant === 'error' ? <Button href="/checkout" size="lg">Reintentar pago</Button> : <Button href="/tienda" size="lg">Seguir comprando</Button>}
        <Button href={whatsappLink(`¡Hola, PokeShop Coast! 👋 Tengo una consulta por mi pedido ${order?.order_code || ''}`.trim())} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">
          Consultar por WhatsApp
        </Button>
      </div>
    </section>
  );
}
