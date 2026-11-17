'use client';
import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Package } from 'lucide-react';
import { getServices } from '@/services/container';
import { useAsync } from '@/hooks/useAsync';
import { isActiveOrder, orderStatus } from '@/domain/orders';
import Button from '@/components/ui/Button';
import OrderCard from './OrderCard';
import { EmptyState, SectionTitle, SkeletonRows } from './ui';

const FILTERS = [
  { id: 'todos', label: 'Todos', test: () => true },
  { id: 'en-curso', label: 'En curso', test: isActiveOrder },
  { id: 'finalizados', label: 'Finalizados', test: (o) => !isActiveOrder(o) && orderStatus(o.status).step === 3 },
  { id: 'cancelados', label: 'Con problemas', test: (o) => orderStatus(o.status).step < 0 },
];

export default function OrdersSection() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filterId = FILTERS.some((f) => f.id === params.get('filtro')) ? params.get('filtro') : 'todos';
  const { data, loading, error, reload } = useAsync(() => getServices().customer.getOrders(), []);
  const orders = useMemo(() => (Array.isArray(data) ? data : data?.results || []), [data]);
  const visible = orders.filter(FILTERS.find((f) => f.id === filterId).test);

  const setFilter = (id) => router.replace(id === 'todos' ? pathname : `${pathname}?filtro=${id}`, { scroll: false });

  return (
    <div>
      <SectionTitle eyebrow="Mi cuenta" title="Mis pedidos" />

      <div role="tablist" aria-label="Filtrar pedidos" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const count = orders.filter(filter.test).length;
          const selected = filter.id === filterId;
          return (
            <button
              key={filter.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setFilter(filter.id)}
              className={`filter-chip ${selected ? 'is-active' : ''}`}
            >
              {filter.label}
              {!loading && <span className="ml-1.5 opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonRows rows={4} />
      ) : error ? (
        <EmptyState icon={Package} title="No pudimos cargar tus pedidos" action={<Button onClick={reload} variant="outline">Reintentar</Button>}>
          Revisá tu conexión y probá de nuevo.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Package}
          title={orders.length ? 'Nada por acá' : 'Todavía no hiciste pedidos'}
          action={!orders.length && <Button href="/tienda">Ir a la tienda</Button>}
        >
          {orders.length ? 'No hay pedidos con este filtro.' : 'Cuando compres, vas a poder seguir tus pedidos desde acá.'}
        </EmptyState>
      ) : (
        <div key={filterId} className="stagger space-y-3">
          {visible.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
