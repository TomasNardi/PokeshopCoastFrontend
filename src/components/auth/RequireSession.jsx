'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/services/auth/authService';
import { useSession } from './SessionProvider';

/** Guard de cliente para /cuenta/*. El backend valida el token igual: esto es UX. */
export default function RequireSession({ children, fallback = null }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'anonymous') router.replace(`${AUTH_ROUTES.login}?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status === 'disabled') return <p className="container-site py-20 text-coast-gray">Las cuentas no están disponibles por ahora.</p>;
  // Mientras se confirma la sesión (o se redirige al login) se ve el esqueleto del panel.
  if (status !== 'authenticated') return fallback;
  return children;
}
