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
import { Card, Collapsible, OrderProgress, Skeleton, StatusPill } from './ui';
import Thumb from '@/components/ui/Thumb';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 13) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function Stat({ label, value, href, Icon }) {
  return (
    <Link href={href} className="group block min-w-0 rounded-2xl border border-coast-line bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover md:p-5">
      <div className="flex items-center justify-between gap-1 text-uns-muted">
        <span className="truncate text-[10px] font-bold uppercase tracking-[0.06em] md:text-[11px] md:tracking-[0.1em]">{label}</span>
        <Icon size={14} className="hidden shrink-0 transition-colors group-hover:text-coast-red sm:block md:h-4 md:w-4" />
      </div>
      <p className="mt-1.5 font-heading text-[26px] font-bold leading-none md:mt-3 md:text-[40px]">{value}</p>
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-coast-line bg-coast-cream/60 px-4 py-3 md:gap-3 md:px-6 md:py-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <p className="eyebrow hidden sm:block">Tu pedido en curso</p>
          <StatusPill status={order.status} />
        </div>
        <Link href={`/cuenta/pedidos/${order.order_code}`} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.075em] hover:text-coast-red md:text-[12px]">
          Ver detalle <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="flex shrink-0 -space-x-4">
            {order.items.slice(0, 3).map((item) => (
              <Thumb key={item.product_slug} src={item.image_url} className="h-16 w-[46px] rounded-md border-2 border-white bg-uns-stage object-contain shadow-sm md:h-20 md:w-[58px]" />
            ))}
          </div>
          <div className="min-w-0 md:max-w-[220px]">
            <p className="font-heading text-[18px] font-bold leading-tight md:text-[20px]">{order.order_code}</p>
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
    <div className="space-y-5 md:space-y-8">
      <header>
        <p className="eyebrow mb-2 hidden lg:block">Mi cuenta</p>
        <h1 className="font-heading text-[26px] font-bold leading-none md:text-[56px]">
          {greeting()}{firstName && `, ${firstName}`}
        </h1>
      </header>

      <div className="stagger grid grid-cols-3 gap-2 md:gap-4">
        <Stat label="Pedidos" value={loading ? '–' : list.length} href="/cuenta/pedidos" Icon={Package} />
        <Stat label="En curso" value={loading ? '–' : active.length} href="/cuenta/pedidos?filtro=en-curso" Icon={ShoppingBag} />
        <Stat label="Sin leer" value={unread} href="/cuenta/notificaciones" Icon={Bell} />
      </div>

      {active[0] && <CurrentOrder code={active[0].order_code} />}

      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Collapsible
          title="Últimos pedidos"
          meta={!loading && list.length > 0 && `(${list.length})`}
          action={<Link href="/cuenta/pedidos" className="text-[12px] font-bold uppercase tracking-[0.075em] text-uns-muted hover:text-coast-red">Ver todos</Link>}
        >
          {loading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[84px] w-full rounded-2xl" />)}</div>
          ) : list.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[14px] text-uns-muted">Todavía no hiciste pedidos.</p>
              <Button href="/tienda" className="mt-5">Ir a la tienda</Button>
            </Card>
          ) : (
            <div className="stagger space-y-2 md:space-y-3">
              {list.slice(0, 3).map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
          )}
        </Collapsible>

        <Collapsible
          title="Novedades"
          meta={unread > 0 && `${unread} sin leer`}
          defaultOpen={false}
          action={<Link href="/cuenta/notificaciones" className="text-[12px] font-bold uppercase tracking-[0.075em] text-uns-muted hover:text-coast-red">Ver todas</Link>}
        >
          <Card as="ul" className="divide-y divide-uns-hairline">
            {notifications.length === 0 && <li className="p-6 text-[13px] text-uns-muted">Sin novedades por ahora.</li>}
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id}>
                <Link href={n.url || '/cuenta/notificaciones'} className="flex gap-3 p-3 transition-colors hover:bg-uns-bg md:p-4">
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

          <Link href="/cuenta/direcciones" className="mt-4 hidden items-center gap-3 rounded-2xl border border-coast-line bg-white p-4 transition-colors hover:border-coast-ink/30 lg:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coast-cream"><MapPin size={16} /></span>
            <span className="flex-1 text-[13px] font-semibold">Tus direcciones de envío</span>
            <ArrowRight size={16} className="text-coast-mist" />
          </Link>
        </Collapsible>
      </div>
    </div>
  );
}
