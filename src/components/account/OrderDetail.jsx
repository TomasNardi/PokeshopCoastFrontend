'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Check, Copy, ExternalLink, MapPin, MessageCircle, Store, Truck } from 'lucide-react';
import { getServices } from '@/services/container';
import { useAsync } from '@/hooks/useAsync';
import { formatPrice } from '@/domain/money';
import { formatDate, PAYMENT_LABELS, timeAgo } from '@/domain/orders';
import { whatsappLink } from '@/config/site';
import Button from '@/components/ui/Button';
import { Card, Collapsible, EmptyState, OrderProgress, Skeleton, StatusPill } from './ui';
import Thumb from '@/components/ui/Thumb';

function CopyValue({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* el navegador no deja copiar: el valor igual está a la vista */
    }
  };
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 font-bold transition-colors hover:text-coast-red" aria-label={`Copiar ${value}`}>
      {value}
      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} className="text-coast-mist" />}
    </button>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 ${strong ? 'text-[17px] font-bold' : 'text-[14px]'}`}>
      <span className={strong ? '' : 'text-uns-muted'}>{label}</span>
      <span className={strong ? '' : 'font-semibold'}>{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export default function OrderDetail({ code }) {
  const { data: order, loading, error } = useAsync(() => getServices().customer.getOrder(code), [code]);

  if (loading) return <DetailSkeleton />;
  if (error || !order) {
    return (
      <EmptyState icon={AlertCircle} title="No encontramos ese pedido" action={<Button href="/cuenta/pedidos" variant="outline">Ver mis pedidos</Button>}>
        Puede que el código esté mal o que el pedido sea de otra cuenta.
      </EmptyState>
    );
  }

  const pickup = order.shipping?.type === 'pickup';
  const timeline = [...(order.timeline || [])].reverse();

  return (
    <div className="space-y-4 md:space-y-6">
      <Link href="/cuenta/pedidos" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.075em] text-uns-muted transition-colors hover:text-coast-ink">
        <ArrowLeft size={14} /> Mis pedidos
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3 md:gap-4">
        <div>
          <p className="eyebrow mb-1.5 md:mb-2">Pedido del {formatDate(order.created_at)}</p>
          <h1 className="font-heading text-[28px] font-bold leading-none tracking-wide md:text-[52px]">{order.order_code}</h1>
        </div>
        <StatusPill status={order.status} />
      </header>

      {/* Progreso o problema */}
      {order.status === 'rejected' || order.status === 'cancelled' ? (
        <Card className="flex gap-4 border-coast-red/30 bg-coast-red-soft/40 p-5">
          <AlertCircle className="mt-0.5 shrink-0 text-coast-red-dark" size={20} />
          <div>
            <p className="font-bold">{order.status === 'rejected' ? 'No pudimos validar tu pago' : 'Pedido cancelado'}</p>
            {order.rejection_reason && <p className="mt-1 text-[14px] text-coast-ink/80">{order.rejection_reason}</p>}
            <Button href={whatsappLink(`Hola! Te escribo por mi pedido ${order.order_code}`)} variant="outline" size="sm" className="mt-4" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={14} /> Escribinos por WhatsApp
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="px-3 py-4 sm:p-6 md:px-8">
          <OrderProgress status={order.status} shippingType={order.shipping?.type} />
        </Card>
      )}

      {/* Datos para transferir mientras se revisa */}
      {order.transfer && (
        <Card className="border-amber-200 bg-amber-50/50 p-4 md:p-6">
          <p className="eyebrow mb-3 text-amber-800">Estamos revisando tu comprobante</p>
          <p className="mb-4 text-[14px] text-coast-ink/80">Te avisamos apenas confirmemos el pago. Si todavía no transferiste, estos son los datos:</p>
          <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
            <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-uns-muted">Alias</dt><dd><CopyValue value={order.transfer.alias} /></dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-uns-muted">CBU</dt><dd><CopyValue value={order.transfer.cbu} /></dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-uns-muted">Titular</dt><dd className="font-semibold">{order.transfer.holder}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-uns-muted">Banco</dt><dd className="font-semibold">{order.transfer.bank}</dd></div>
          </dl>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* Productos y totales */}
          <Collapsible title="Productos" meta={`(${order.items.length}) · ${formatPrice(order.total)}`}>
          <Card>
            <ul className="stagger divide-y divide-uns-hairline">
              {order.items.map((item) => (
                <li key={`${item.product_slug}-${item.product_name}`} className="flex items-center gap-3 p-3 md:gap-4 md:p-5">
                  <Link href={item.product_slug ? `/tienda/${item.product_slug}` : '#'} className="shrink-0">
                    <Thumb src={item.image_url} className="h-14 w-[42px] rounded-md bg-uns-stage object-contain p-0.5 md:h-20 md:w-[60px] md:p-1" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug md:text-[14px]">{item.product_name}</p>
                    <p className="mt-1 text-[11px] text-uns-muted md:text-[12px]">{item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold md:text-[15px]">{formatPrice(item.line_total)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-coast-line bg-uns-bg px-4 py-3 md:px-6 md:py-4">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {Number(order.discount_amount) > 0 && <Row label={`Descuento ${order.discount_code}`} value={`-${formatPrice(order.discount_amount)}`} />}
              <Row label="Envío" value={Number(order.shipping_cost) ? formatPrice(order.shipping_cost) : 'Sin cargo'} />
              {Number(order.surcharge_amount) > 0 && <Row label="Recargo Mercado Pago" value={formatPrice(order.surcharge_amount)} />}
              <div className="mt-2 border-t border-coast-line pt-2">
                <Row label="Total" value={formatPrice(order.total)} strong />
              </div>
              <p className="mt-1 text-[12px] text-uns-muted">Pagado con {PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
            </div>
          </Card>
          </Collapsible>
        </div>

        <div className="min-w-0 space-y-4 md:space-y-6">
          {/* Entrega */}
          <Card className="p-4 md:p-6">
            <p className="eyebrow mb-3 md:mb-4">Entrega</p>
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coast-cream">
                {pickup ? <Store size={18} /> : <MapPin size={18} />}
              </span>
              <div className="text-[14px]">
                <p className="font-bold">{order.shipping?.method_label}</p>
                {pickup ? (
                  <p className="text-uns-muted">{order.shipping?.branch || 'Coordinamos por WhatsApp'}</p>
                ) : (
                  <p className="text-uns-muted">
                    {order.shipping?.address}<br />
                    {[order.shipping?.city, order.shipping?.province, order.shipping?.zip].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {order.tracking && (
              <div className="mt-5 rounded-xl bg-uns-stage p-4">
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-uns-muted">
                  <Truck size={14} /> {order.tracking.carrier}
                </div>
                <div className="mt-1.5 text-[16px]"><CopyValue value={order.tracking.code} /></div>
                {order.tracking.url && (
                  <a href={order.tracking.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.075em] text-coast-red hover:underline">
                    Seguir el envío <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}
          </Card>

          {/* Historial: plegado en celular, siempre visible en escritorio */}
          <Collapsible title="Historial" meta={timeline.length > 0 && `(${timeline.length})`} defaultOpen={false}>
          <Card className="p-4 md:p-6">
            <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-coast-line">
              {timeline.map((event, index) => (
                <li key={`${event.at}-${index}`} className="timeline-item relative pl-6" style={{ animationDelay: `${index * 80}ms` }}>
                  <span className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-white ${index === 0 ? 'bg-coast-red ring-4 ring-coast-red-soft' : 'bg-coast-mist'}`} />
                  <p className={`text-[14px] ${index === 0 ? 'font-bold' : 'font-medium text-coast-ink/80'}`}>{event.message}</p>
                  <p className="text-[12px] text-coast-mist">{timeAgo(event.at)}</p>
                </li>
              ))}
            </ol>
          </Card>
          </Collapsible>

          <Button
            href={whatsappLink(`Hola! Tengo una consulta por mi pedido ${order.order_code}`)}
            variant="outline"
            block
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={15} /> Consultar por este pedido
          </Button>
          {order.status === 'paid' && (
            <Link
              href={`/arrepentimiento?pedido=${encodeURIComponent(order.order_code)}`}
              className="block text-center text-[12px] font-semibold text-uns-muted underline underline-offset-4 hover:text-coast-ink"
            >
              Botón de arrepentimiento
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
