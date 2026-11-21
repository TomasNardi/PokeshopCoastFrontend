'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { timeAgo } from '@/domain/orders';
import { useNotifications } from './NotificationsProvider';
import NotificationIcon from './NotificationIcon';

const PREVIEW = 5;

/**
 * Campanita del header: contador animado y desplegable con los últimos avisos.
 * Cierra con Escape, clic afuera o al navegar. Al abrir un aviso se marca leído.
 */
export default function NotificationBell() {
  const { unread, results, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const previous = useRef(unread);
  const root = useRef(null);
  const router = useRouter();
  const panelId = useId();

  // El contador "late" cuando llega un aviso nuevo.
  useEffect(() => {
    if (unread > previous.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 600);
      previous.current = unread;
      return () => clearTimeout(t);
    }
    previous.current = unread;
    return undefined;
  }, [unread]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [open]);

  const go = (notification) => {
    setOpen(false);
    if (!notification.read_at) markRead([notification.id]);
    if (notification.url) router.push(notification.url);
  };

  return (
    <div ref={root} className="md:relative">
      <button
        type="button"
        className="header-icon"
        aria-label={unread ? `Notificaciones (${unread} sin leer)` : 'Notificaciones'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={21} strokeWidth={2} className={bump ? 'bell-ring' : ''} />
        {unread > 0 && <span className={`header-icon__count ${bump ? 'count-pop' : ''}`}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      <div id={panelId} role="dialog" aria-label="Notificaciones" className={`bell-panel ${open ? 'is-open' : ''}`}>
        <div className="flex items-center justify-between border-b border-uns-hairline px-5 py-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em]">Notificaciones</p>
          {unread > 0 && (
            <button type="button" onClick={() => markRead()} className="text-[12px] font-semibold text-uns-muted transition-colors hover:text-coast-red">
              Marcar todas como leídas
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-uns-muted">No tenés notificaciones todavía.</p>
        ) : (
          <ul className="max-h-[380px] overflow-y-auto">
            {results.slice(0, PREVIEW).map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => go(n)} className="notification-row w-full text-left">
                  <NotificationIcon event={n.event} unread={!n.read_at} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13px] ${n.read_at ? 'font-medium' : 'font-bold'}`}>{n.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-uns-muted">{n.body}</span>
                    <span className="mt-1 block text-[11px] text-coast-mist">{timeAgo(n.created_at)}</span>
                  </span>
                  {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coast-red" aria-label="Sin leer" />}
                </button>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/cuenta/notificaciones"
          onClick={() => setOpen(false)}
          className="block border-t border-uns-hairline px-5 py-3.5 text-center text-[12px] font-bold uppercase tracking-[0.075em] transition-colors hover:bg-uns-stage"
        >
          Ver todas
        </Link>
      </div>
    </div>
  );
}
