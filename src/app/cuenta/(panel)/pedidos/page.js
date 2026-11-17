import { Suspense } from 'react';
import OrdersSection from '@/components/account/OrdersSection';
import { SkeletonRows } from '@/components/account/ui';

export const metadata = { title: 'Mis pedidos' };

export default function PedidosPage() {
  return (
    <Suspense fallback={<SkeletonRows rows={4} />}>
      <OrdersSection />
    </Suspense>
  );
}
