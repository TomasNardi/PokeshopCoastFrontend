import { AlertCircle, CheckCircle2, PackageCheck, Receipt, Store, Truck, Undo2, XCircle } from 'lucide-react';

/** Ícono y color por tipo de aviso (mismos eventos que apps/notifications/messages.py). */
const ICONS = {
  order_placed_transfer: { Icon: Receipt, tone: 'bg-coast-cream text-coast-ink' },
  order_paid: { Icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
  order_shipped: { Icon: Truck, tone: 'bg-sky-50 text-sky-700' },
  order_ready_for_pickup: { Icon: Store, tone: 'bg-emerald-50 text-emerald-700' },
  order_delivered: { Icon: PackageCheck, tone: 'bg-uns-stage text-coast-ink' },
  order_transfer_rejected: { Icon: AlertCircle, tone: 'bg-coast-red-soft text-coast-red-dark' },
  order_cancelled: { Icon: XCircle, tone: 'bg-coast-red-soft text-coast-red-dark' },
  order_refunded: { Icon: Undo2, tone: 'bg-uns-stage text-coast-ink' },
};

export default function NotificationIcon({ event, unread = false, size = 36 }) {
  const { Icon, tone } = ICONS[event] || { Icon: Receipt, tone: 'bg-uns-stage text-coast-ink' };
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${tone} ${unread ? '' : 'opacity-70'}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon size={Math.round(size * 0.47)} strokeWidth={2} />
    </span>
  );
}
