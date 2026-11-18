'use client';
import Link from 'next/link';
import { ArrowRight, Bell, MapPin, Package, ShoppingBag } from 'lucide-react';
import { getServices } from '@/services/container';
import { useAsync } from '@/hooks/useAsync';
import { formatPrice } from '@/domain/money';
import { isActiveOrder, timeAgo } from '@/domain/orders';
import { useSession } from '@/components/auth/SessionProvider';
import Button from '@/components/ui/Button';
import { useNotifications } from './NotificationsProvider';
import NotificationIcon from './NotificationIcon';
import OrderCard from './OrderCard';
import { Card, OrderProgress, Skeleton, StatusPill } from './ui';
import Thumb from '@/components/ui/Thumb';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 13) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function Stat({ label, value, href, Icon }) {
  return (
    <Link href={href} className="group block rounded-2xl border border-coast-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between text-uns-muted">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em]">{label}</span>
        <Icon size={16} className="transition-colors group-hover:text-coast-red" />
      </div>
      <p className="mt-3 font-heading text-[40px] font-bold leading-none">{value}</p>
    </Link>
  );
}

/** Pedido "vivo" más reciente, con su progreso. */
function CurrentOrder({ code }) {
  const { data: order, loading } = useAsync(() => getServices().customer.getOrder(code), [code]);
  if (loading || !order) return <Card className="p-6"><Skeleton className="h-5 w-40" /><Skeleton className="mt-6 h-16 w-full" /></Card>;

  const first = order.items[0];
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-coast-line bg-coast-cream/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <p className="eyebrow">Tu pedido en curso</p>
          <StatusPill status={order.status} />
        </div>
        <Link href={`/cuenta/pedidos/${order.order_code}`} className="inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.075em] hover:text-coast-red">
          Ver detalle <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-4">
            {order.items.slice(0, 3).map((item) => (
              <Thumb key={item.product_slug} src={item.image_url} className="h-20 w-[58px] rounded-md border-2 border-white bg-uns-stage object-contain shadow-sm" />
            ))}
          </div>
          <div className="min-w-0 md:max-w-[220px]">
            <p className="font-heading text-[20px] font-bold leading-tight">{order.order_code}</p>
            <p className="mt-1 line-clamp-2 text-[13px] text-uns-muted">
              {first?.product_name}
              {order.items.length > 1 && ` y ${order.items.length - 1} más`}
            </p>
            <p className="mt-1 text-[14px] font-bold">{formatPrice(order.total)}</p>
          </div>
        </div>
        <OrderProgress status={order.status} shippingType={order.shipping?.type} />
      </div>
    </Card>
  );
}

export default function AccountHome() {
  const { user, profile } = useSession();
  const { unread, results: notifications } = useNotifications();
  const { data: orders, loading } = useAsync(() => getServices().customer.getOrders(), []);
  const list = Array.isArray(orders) ? orders : orders?.results || [];
  const active = list.filter(isActiveOrder);
  const firstName = profile?.first_name || user?.name?.split(' ')[0] || '';

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2">Mi cuenta</p>
        <h1 className="font-heading text-[40px] font-bold leading-none md:text-[56px]">
          {greeting()}{firstName && `, ${firstName}`}
        </h1>
      </header>

      <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Stat label="Pedidos" value={loading ? '–' : list.length} href="/cuenta/pedidos" Icon={Package} />
        <Stat label="En curso" value={loading ? '–' : active.length} href="/cuenta/pedidos?filtro=en-curso" Icon={ShoppingBag} />
        <div className="col-span-2 md:col-span-1">
          <Stat label="Sin leer" value={unread} href="/cuenta/notificaciones" Icon={Bell} />
        </div>
      </div>

      {active[0] && <CurrentOrder code={active[0].order_code} />}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-[24px] font-bold leading-none">Últimos pedidos</h2>
            <Link href="/cuenta/pedidos" className="text-[12px] font-bold uppercase tracking-[0.075em] text-uns-muted hover:text-coast-red">Ver todos</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[84px] w-full rounded-2xl" />)}</div>
          ) : list.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[14px] text-uns-muted">Todavía no hiciste pedidos.</p>
              <Button href="/tienda" className="mt-5">Ir a la tienda</Button>
            </Card>
          ) : (
            <div className="stagger space-y-3">
              {list.slice(0, 3).map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-[24px] font-bold leading-none">Novedades</h2>
            <Link href="/cuenta/notificaciones" className="text-[12px] font-bold uppercase tracking-[0.075em] text-uns-muted hover:text-coast-red">Ver todas</Link>
          </div>
          <Card as="ul" className="divide-y divide-uns-hairline">
            {notifications.length === 0 && <li className="p-6 text-[13px] text-uns-muted">Sin novedades por ahora.</li>}
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id}>
                <Link href={n.url || '/cuenta/notificaciones'} className="flex gap-3 p-4 transition-colors hover:bg-uns-bg">
                  <NotificationIcon event={n.event} unread={!n.read_at} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13px] ${n.read_at ? 'font-medium' : 'font-bold'}`}>{n.title}</span>
                    <span className="block truncate text-[12px] text-uns-muted">{n.body}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-coast-mist">{timeAgo(n.created_at)}</span>
                </Link>
              </li>
            ))}
          </Card>

          <Link href="/cuenta/direcciones" className="mt-4 flex items-center gap-3 rounded-2xl border border-coast-line bg-white p-4 transition-colors hover:border-coast-ink/30">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coast-cream"><MapPin size={16} /></span>
            <span className="flex-1 text-[13px] font-semibold">Tus direcciones de envío</span>
            <ArrowRight size={16} className="text-coast-mist" />
          </Link>
        </section>
      </div>
    </div>
  );
}
