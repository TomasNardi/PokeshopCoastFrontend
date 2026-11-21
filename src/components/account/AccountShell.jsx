'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LayoutGrid, LogOut, MapPin, Package, UserRound } from 'lucide-react';
import RequireSession from '@/components/auth/RequireSession';
import { useSession } from '@/components/auth/SessionProvider';
import { useNotifications } from './NotificationsProvider';
import { LoadingRegion, Skeleton } from '@/components/ui/Skeleton';
import { SkeletonRows } from './ui';

export const ACCOUNT_NAV = [
  // `short`: rótulo de la barra de 5 ítems del celular (tiene que entrar en 320px).
  { href: '/cuenta', label: 'Resumen', short: 'Inicio', Icon: LayoutGrid, exact: true },
  { href: '/cuenta/pedidos', label: 'Pedidos', short: 'Pedidos', Icon: Package },
  { href: '/cuenta/notificaciones', label: 'Notificaciones', short: 'Avisos', Icon: Bell, badge: 'unread' },
  { href: '/cuenta/direcciones', label: 'Direcciones', short: 'Envíos', Icon: MapPin },
  { href: '/cuenta/perfil', label: 'Perfil', short: 'Perfil', Icon: UserRound },
];

const isActive = (pathname, item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

export function displayName(user, profile) {
  return [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.name || user?.email || '';
}

function Avatar({ name, url, small = false }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '·';
  const size = small ? 'h-10 w-10 text-[15px]' : 'h-12 w-12 text-[18px]';
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-coast-ink font-heading font-bold text-white`} aria-hidden="true">
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
    <div className="container-site pb-16 pt-4 md:pt-8 lg:pb-20 lg:pt-12">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
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
        <div className="min-w-0 lg:hidden">
          <div className="mb-3 flex items-center gap-3">
            <Avatar name={name} url={user?.avatarUrl} small />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-[18px] font-bold leading-tight">{name}</p>
              <p className="truncate text-[11px] text-uns-muted">{user?.email}</p>
            </div>
            <button type="button" onClick={signOut} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-coast-line px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-uns-muted" aria-label="Cerrar sesión">
              <LogOut size={14} /> Salir
            </button>
          </div>
          {/* 5 secciones siempre a la vista: un toque, sin scroll lateral. */}
          <nav aria-label="Mi cuenta" className="account-bar">
            {ACCOUNT_NAV.map((item) => {
              const active = isActive(pathname, item);
              const count = badge(item);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} aria-label={item.label} className={`account-bar__item ${active ? 'is-active' : ''}`}>
                  <span className="relative">
                    <item.Icon size={18} strokeWidth={active ? 2.3 : 1.9} />
                    {count > 0 && <span className="account-bar__count">{count > 9 ? '9+' : count}</span>}
                  </span>
                  <span className="account-bar__label">{item.short}</span>
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

/** Mismo marco que Shell mientras se confirma la sesión: nada salta al entrar. */
export function AccountShellSkeleton() {
  return (
    <LoadingRegion label="Cargando tu cuenta" className="container-site pb-16 pt-4 md:pt-8 lg:pb-20 lg:pt-12">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="flex items-center gap-3 border-b border-coast-line pb-6">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="space-y-2 py-4">
            {ACCOUNT_NAV.map((item) => (
              <Skeleton key={item.href} className="h-10 w-full" />
            ))}
          </div>
        </aside>
        <div className="min-w-0 lg:hidden">
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-[54px] w-full rounded-2xl" />
        </div>
        <div className="min-w-0">
          <Skeleton className="mb-5 h-8 w-48" />
          <SkeletonRows rows={3} />
        </div>
      </div>
    </LoadingRegion>
  );
}

export default function AccountShell({ children }) {
  return (
    <RequireSession fallback={<AccountShellSkeleton />}>
      <Shell>{children}</Shell>
    </RequireSession>
  );
}
