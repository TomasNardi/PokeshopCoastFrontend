'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LayoutGrid, LogOut, MapPin, Package, UserRound } from 'lucide-react';
import RequireSession from '@/components/auth/RequireSession';
import { useSession } from '@/components/auth/SessionProvider';
import { useNotifications } from './NotificationsProvider';

export const ACCOUNT_NAV = [
  { href: '/cuenta', label: 'Resumen', Icon: LayoutGrid, exact: true },
  { href: '/cuenta/pedidos', label: 'Pedidos', Icon: Package },
  { href: '/cuenta/notificaciones', label: 'Notificaciones', Icon: Bell, badge: 'unread' },
  { href: '/cuenta/direcciones', label: 'Direcciones', Icon: MapPin },
  { href: '/cuenta/perfil', label: 'Perfil', Icon: UserRound },
];

const isActive = (pathname, item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

export function displayName(user, profile) {
  return [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.name || user?.email || '';
}

function Avatar({ name, url }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '·';
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="h-12 w-12 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-coast-ink font-heading text-[18px] font-bold text-white" aria-hidden="true">
      {initials}
    </span>
  );
}

/**
 * Marco del panel "Mi cuenta": barra lateral en escritorio, pestañas
 * deslizables en celular y una transición de entrada por sección.
 */
function Shell({ children }) {
  const pathname = usePathname();
  const { user, profile, signOut } = useSession();
  const { unread } = useNotifications();
  const name = displayName(user, profile);
  const badge = (item) => (item.badge === 'unread' && unread > 0 ? unread : 0);

  return (
    <div className="container-site pb-20 pt-8 md:pt-12">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        {/* Escritorio */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height)+24px)]">
            <div className="flex items-center gap-3 border-b border-coast-line pb-6">
              <Avatar name={name} url={user?.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate font-heading text-[20px] font-bold leading-tight">{name}</p>
                <p className="truncate text-[12px] text-uns-muted">{user?.email}</p>
              </div>
            </div>

            <nav aria-label="Mi cuenta" className="py-4">
              <ul className="space-y-1">
                {ACCOUNT_NAV.map((item) => {
                  const active = isActive(pathname, item);
                  const count = badge(item);
                  return (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={active ? 'page' : undefined} className={`account-nav-link ${active ? 'is-active' : ''}`}>
                        <item.Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                        <span className="flex-1">{item.label}</span>
                        {count > 0 && <span className="rounded-full bg-coast-red px-2 py-0.5 text-[11px] font-bold leading-none text-white">{count}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <button type="button" onClick={signOut} className="account-nav-link w-full border-t border-coast-line pt-5 text-uns-muted">
              <LogOut size={18} strokeWidth={1.8} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Celular / tablet */}
        <div className="lg:hidden">
          <div className="mb-5 flex items-center gap-3">
            <Avatar name={name} url={user?.avatarUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-[22px] font-bold leading-tight">{name}</p>
              <p className="truncate text-[12px] text-uns-muted">{user?.email}</p>
            </div>
            <button type="button" onClick={signOut} className="header-icon text-uns-muted" aria-label="Cerrar sesión">
              <LogOut size={20} />
            </button>
          </div>
          <nav aria-label="Mi cuenta" className="account-tabs -mx-[var(--outer)] px-[var(--outer)]">
            {ACCOUNT_NAV.map((item) => {
              const active = isActive(pathname, item);
              const count = badge(item);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`account-tab ${active ? 'is-active' : ''}`}>
                  <item.Icon size={15} strokeWidth={2} />
                  {item.label}
                  {count > 0 && <span className="rounded-full bg-coast-red px-1.5 text-[10px] font-bold leading-[16px] text-white">{count}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* La key reinicia la animación de entrada en cada sección. */}
        <div key={pathname.split('/').slice(0, 3).join('/')} className="account-enter min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AccountShell({ children }) {
  return (
    <RequireSession>
      <Shell>{children}</Shell>
    </RequireSession>
  );
}
