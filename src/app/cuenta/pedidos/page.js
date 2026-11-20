import PageHeader from '@/components/ui/PageHeader';
import RequireSession from '@/components/auth/RequireSession';
import { OrdersList } from '@/components/account/AccountOverview';

export const metadata = { title: 'Mis pedidos' };

export default function PedidosPage() {
  return (
    <RequireSession>
      <PageHeader eyebrow="Mi cuenta" title="Mis pedidos" />
      <div className="container-site">
        <div className="fade-up border border-uns-hairline bg-white p-5 sm:p-6">
          <OrdersList />
        </div>
      </div>
    </RequireSession>
  );
}
