'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getServices } from '@/services/container';
import { useSession } from '@/components/auth/SessionProvider';

/**
 * Bandeja in-app del comprador (la campanita).
 * Pide /notifications/ al iniciar sesión, cada minuto con la pestaña visible
 * y al volver a la pestaña. Marcar como leída es optimista: la UI cambia al
 * toque y el backend se entera después.
 */
const NotificationsContext = createContext(null);
const POLL_MS = 60_000;
const EMPTY = { unread: 0, results: [] };

export function NotificationsProvider({ children, services = getServices() }) {
  const { isAuthenticated } = useSession();
  const [inbox, setInbox] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const active = useRef(false);

  const refresh = useCallback(async () => {
    if (!active.current || typeof services.customer.getNotifications !== 'function') return;
    try {
      const data = await services.customer.getNotifications();
      if (active.current) {
        setInbox({ unread: data?.unread ?? 0, results: data?.results ?? [] });
        setLoaded(true);
      }
    } catch {
      /* sin red o sesión vencida: se reintenta en el próximo ciclo */
    }
  }, [services]);

  useEffect(() => {
    active.current = isAuthenticated;
    if (!isAuthenticated) {
      setInbox(EMPTY);
      setLoaded(false);
      return undefined;
    }
    refresh();
    const timer = setInterval(() => document.visibilityState === 'visible' && refresh(), POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active.current = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, refresh]);

  const markRead = useCallback(
    async (ids) => {
      const now = new Date().toISOString();
      setInbox((prev) => {
        const results = prev.results.map((n) => (!n.read_at && (!ids || ids.includes(n.id)) ? { ...n, read_at: now } : n));
        return { results, unread: results.filter((n) => !n.read_at).length };
      });
      try {
        await services.customer.markNotificationsRead(ids);
      } catch {
        refresh();
      }
    },
    [services, refresh]
  );

  const value = useMemo(() => ({ ...inbox, loaded, refresh, markRead }), [inbox, loaded, refresh, markRead]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

const NOOP = Object.freeze({ ...EMPTY, loaded: false, refresh: async () => {}, markRead: async () => {} });

/** Fuera del provider (tests de componentes sueltos) devuelve una bandeja vacía. */
export function useNotifications() {
  return useContext(NotificationsContext) ?? NOOP;
}
