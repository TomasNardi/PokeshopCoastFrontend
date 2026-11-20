'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Package } from 'lucide-react';
import { getServices } from '@/services/container';
import { formatPrice } from '@/domain/money';
import { useSession } from '@/components/auth/SessionProvider';
import Button from '@/components/ui/Button';

const STATUS_LABELS = {
  pending_payment: 'Pendiente de pago',
  awaiting_transfer: 'Esperando transferencia',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export function OrdersList({ limit }) {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    getServices().customer.getOrders().then((data) => setOrders(Array.isArray(data) ? data : data?.results || [])).catch(() => setOrders([]));
  }, []);

  if (orders === null) return <p className="text-[14px] text-coast-gray">Cargando pedidos…</p>;
  if (orders.length === 0) return <p className="text-[14px] text-coast-gray">Todavía no hiciste pedidos.</p>;

  return (
    <ul className="divide-y divide-uns-hairline">
      {orders.slice(0, limit).map((order) => (
        <li key={order.id} className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Package size={18} className="text-coast-red" />
            <div>
              <p className="font-semibold">{order.order_code}</p>
              <p className="text-[12px] text-coast-gray">{new Date(order.created_at).toLocaleDateString('es-AR')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{formatPrice(order.total)}</p>
            <p className="text-[12px] text-coast-gray">{STATUS_LABELS[order.status] || order.status}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AccountOverview() {
  const { user, profile, signOut } = useSession();
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.name || user?.email;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <div className="fade-up border border-uns-hairline bg-white p-5 sm:p-6">
        <p className="eyebrow mb-2">Tu perfil</p>
        <p className="text-xl font-bold">{name}</p>
        <p className="text-[14px] text-coast-gray">{user?.email}</p>
        {user?.provider === 'google' && <p className="mt-2 text-[12px] text-coast-mist">Ingresaste con Google</p>}
        <Button variant="outline" size="sm" className="mt-6" onClick={signOut}>
          <LogOut size={13} /> Cerrar sesión
        </Button>
      </div>
      <div className="fade-up border border-uns-hairline bg-white p-5 sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="eyebrow">Últimos pedidos</p>
          <Link href="/cuenta/pedidos" className="text-[12px] font-semibold text-coast-gray hover:text-coast-red">Ver todos</Link>
        </div>
        <OrdersList limit={3} />
      </div>
    </div>
  );
}
