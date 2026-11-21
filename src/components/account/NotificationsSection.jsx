'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { timeAgo } from '@/domain/orders';
import Button from '@/components/ui/Button';
import { useNotifications } from './NotificationsProvider';
import NotificationIcon from './NotificationIcon';
import { Card, EmptyState, SectionTitle, SkeletonRows } from './ui';

const DAY = 24 * 3600 * 1000;

function groupOf(iso) {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const time = new Date(iso).getTime();
  if (time >= startOfToday) return 'Hoy';
  if (time >= startOfToday - DAY) return 'Ayer';
  if (time >= startOfToday - 7 * DAY) return 'Esta semana';
  return 'Anteriores';
}

export default function NotificationsSection() {
  const { results, unread, loaded, markRead } = useNotifications();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const visible = onlyUnread ? results.filter((n) => !n.read_at) : results;

  const groups = visible.reduce((acc, n) => {
    const name = groupOf(n.created_at);
    (acc[name] ||= []).push(n);
    return acc;
  }, {});

  return (
    <div>
      <SectionTitle
        eyebrow="Mi cuenta"
        title="Notificaciones"
        action={
          unread > 0 && (
            <Button variant="outline" size="sm" onClick={() => markRead()}>
              <CheckCheck size={14} /> Marcar todas
            </Button>
          )
        }
      />

      <div role="tablist" className="mb-4 flex gap-2 md:mb-5">
        <button type="button" role="tab" aria-selected={!onlyUnread} onClick={() => setOnlyUnread(false)} className={`filter-chip ${!onlyUnread ? 'is-active' : ''}`}>
          Todas <span className="ml-1.5 opacity-60">{results.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={onlyUnread} onClick={() => setOnlyUnread(true)} className={`filter-chip ${onlyUnread ? 'is-active' : ''}`}>
          Sin leer <span className="ml-1.5 opacity-60">{unread}</span>
        </button>
      </div>

      {!loaded ? (
        <SkeletonRows rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState icon={Bell} title={onlyUnread ? 'Estás al día' : 'Sin notificaciones'}>
          {onlyUnread ? 'Leíste todas tus notificaciones.' : 'Acá te vamos a avisar cada novedad de tus pedidos.'}
        </EmptyState>
      ) : (
        <div key={String(onlyUnread)} className="space-y-4 md:space-y-6">
          {Object.entries(groups).map(([name, items]) => (
            <section key={name}>
              <p className="eyebrow mb-2.5">{name}</p>
              <Card as="ul" className="stagger divide-y divide-uns-hairline overflow-hidden">
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.url || '#'}
                      onClick={() => !n.read_at && markRead([n.id])}
                      className={`flex gap-3 p-3 transition-colors duration-300 hover:bg-uns-bg md:gap-4 md:p-5 ${n.read_at ? '' : 'bg-coast-cream/40'}`}
                    >
                      <NotificationIcon event={n.event} unread={!n.read_at} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className={`text-[13px] md:text-[14px] ${n.read_at ? 'font-semibold' : 'font-bold'}`}>{n.title}</span>
                          <span className="shrink-0 text-[11px] text-coast-mist">{timeAgo(n.created_at)}</span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-uns-muted md:mt-1 md:line-clamp-none md:text-[13px] md:leading-relaxed">{n.body}</span>
                      </span>
                      <span className={`mt-2 h-2 w-2 shrink-0 rounded-full transition-all duration-500 ${n.read_at ? 'scale-0 bg-transparent' : 'bg-coast-red'}`} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
