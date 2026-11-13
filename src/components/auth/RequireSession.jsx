'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/services/auth/authService';
import { useSession } from './SessionProvider';

/** Guard de cliente para /cuenta/*. El backend valida el token igual: esto es UX. */
export default function RequireSession({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'anonymous') router.replace(`${AUTH_ROUTES.login}?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status === 'disabled') return <p className="container-site py-20 text-coast-gray">Las cuentas no están disponibles por ahora.</p>;
  if (status !== 'authenticated') return <p className="container-site py-20 text-coast-gray">Cargando tu cuenta…</p>;
  return children;
}
