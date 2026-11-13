import PageHeader from '@/components/ui/PageHeader';
import RequireSession from '@/components/auth/RequireSession';
import AccountOverview from '@/components/account/AccountOverview';

export const metadata = { title: 'Mi cuenta' };

export default function CuentaPage() {
  return (
    <RequireSession>
      <PageHeader eyebrow="Mi cuenta" title="Hola de nuevo" />
      <div className="container-site">
        <AccountOverview />
      </div>
    </RequireSession>
  );
}
