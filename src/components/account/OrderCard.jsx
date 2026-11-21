import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { formatPrice } from '@/domain/money';
import { PAYMENT_LABELS } from '@/domain/orders';
import { StatusPill } from './ui';

/** Fila de pedido para los listados. Toda la tarjeta es el link al detalle. */
export default function OrderCard({ order, style }) {
  const date = new Date(order.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <Link
      href={`/cuenta/pedidos/${order.order_code}`}
      style={style}
      className="order-card group flex items-center gap-3 rounded-2xl border border-coast-line bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-coast-ink/30 hover:shadow-card-hover md:gap-4 md:p-5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 md:gap-x-3 md:gap-y-2">
          <p className="font-heading text-[16px] font-bold leading-none tracking-wide md:text-[19px]">{order.order_code}</p>
          <StatusPill status={order.status} />
        </div>
        <p className="mt-1.5 truncate text-[11px] text-uns-muted md:mt-2 md:text-[12px]">
          {date} · {order.items_count} {order.items_count === 1 ? 'producto' : 'productos'}
          <span className="hidden sm:inline"> · {PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
        </p>
      </div>
      <p className="shrink-0 text-right text-[14px] font-bold md:text-[16px]">{formatPrice(order.total)}</p>
      <ChevronRight size={16} className="shrink-0 text-coast-mist transition-transform duration-300 group-hover:translate-x-1 group-hover:text-coast-ink" />
    </Link>
  );
}
