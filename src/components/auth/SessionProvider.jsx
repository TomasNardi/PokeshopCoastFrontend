'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getServices } from '@/services/container';
import { forgetOrderClaims, readOrderClaims } from '@/domain/guestSignup';

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
  // Sube cada vez que termina una sincronización con el backend (bien o mal). Lo que
  // depende de ella (ej. la lista de pedidos, que puede sumar los de invitado) la espera.
  const [syncVersion, setSyncVersion] = useState(0);

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
        const result = await services.customer.syncSession(session.accessToken, {
          email: session.user.email,
          claimTokens: readOrderClaims(),
        });
        // Ya usadas: los pedidos quedaron en esta cuenta (o eran de otra y no se tocan).
        forgetOrderClaims();
        setProfile(result?.profile ?? result ?? null);
      } catch {
        // La sesión es válida aunque el backend no responda: puede comprar igual.
        syncedFor.current = null;
      } finally {
        setSyncVersion((v) => v + 1);
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
      syncVersion,
      signOut: () => services.auth.signOut(),
      finishRecovery: () => setIsRecovering(false),
    }),
    [status, user, profile, isRecovering, syncVersion, services]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession tiene que usarse dentro de <SessionProvider>');
  return ctx;
}
