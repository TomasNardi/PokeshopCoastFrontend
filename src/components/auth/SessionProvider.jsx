'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getServices } from '@/services/container';

/**
 * Sesión del comprador: un único lugar que sabe si hay alguien logueado.
 *   status: 'loading' | 'disabled' | 'anonymous' | 'authenticated'
 *
 * Identidad = proveedor (Supabase: Google / email). Perfil = Django.
 * Al aparecer una sesión se sincroniza UNA vez por usuario con
 * /customers/session/ (crea el cliente y vincula compras de invitado).
 */
const SessionContext = createContext(null);

export function SessionProvider({ children, services = getServices() }) {
  const [status, setStatus] = useState(services.auth.enabled ? 'loading' : 'disabled');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const syncedFor = useRef(null);

  useEffect(() => {
    if (!services.auth.enabled) return undefined;

    return services.auth.onChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);

      if (!session) {
        syncedFor.current = null;
        setUser(null);
        setProfile(null);
        setStatus('anonymous');
        return;
      }
      setUser(session.user);
      setStatus('authenticated');

      if (syncedFor.current === session.user.id) return;
      syncedFor.current = session.user.id;
      try {
        const result = await services.customer.syncSession(session.accessToken, { email: session.user.email });
        setProfile(result?.profile ?? result ?? null);
      } catch {
        // La sesión es válida aunque el backend no responda: puede comprar igual.
        syncedFor.current = null;
      }
    });
  }, [services]);

  const value = useMemo(
    () => ({
      status,
      user,
      profile,
      isRecovering,
      isAuthenticated: status === 'authenticated',
      signOut: () => services.auth.signOut(),
      finishRecovery: () => setIsRecovering(false),
    }),
    [status, user, profile, isRecovering, services]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession tiene que usarse dentro de <SessionProvider>');
  return ctx;
}
