/**
 * Piezas visuales del panel de cuenta: tarjeta, título de sección, estado,
 * progreso del pedido, esqueletos y vacío. Todo con la paleta del sitio.
 */
import { Check } from 'lucide-react';
import { orderStatus, orderSteps } from '@/domain/orders';

export function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-2xl border border-coast-line bg-white ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="font-heading text-[26px] font-bold leading-none md:text-[30px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

const TONES = {
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200',
  ink: 'bg-uns-stage text-coast-ink ring-uns-border/60',
  red: 'bg-coast-red-soft text-coast-red-dark ring-coast-red/30',
  muted: 'bg-uns-stage text-uns-muted ring-uns-border/60',
};

export function StatusPill({ status }) {
  const meta = orderStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ring-1 ring-inset ${TONES[meta.tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/** Stepper del pedido. La barra se llena con transición al montar. */
export function OrderProgress({ status, shippingType, compact = false }) {
  const { step } = orderStatus(status);
  if (step < 0) return null;
  const steps = orderSteps(shippingType);
  const percent = (step / (steps.length - 1)) * 100;

  return (
    <div className={compact ? '' : 'pt-1'}>
      <div className="relative mx-3 h-[3px] rounded-full bg-coast-line">
        <div className="progress-fill absolute inset-y-0 left-0 rounded-full bg-coast-red" style={{ '--progress': `${percent}%` }} />
      </div>
      <ol className="-mt-[11px] grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((label, index) => {
          const done = index <= step;
          const current = index === step;
          return (
            <li key={label} className={`flex flex-col ${index === 0 ? 'items-start' : index === steps.length - 1 ? 'items-end' : 'items-center'}`}>
              <span
                className={`progress-dot flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                  done ? 'border-coast-red bg-coast-red text-white' : 'border-coast-line bg-white'
                } ${current ? 'is-current' : ''}`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {done && <Check size={11} strokeWidth={3.5} />}
              </span>
              {!compact && (
                <span className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.06em] ${done ? 'text-coast-ink' : 'text-coast-mist'}`}>{label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <span className={`skeleton block rounded-lg ${className}`} aria-hidden="true" />;
}

export function SkeletonRows({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-coast-line bg-white p-5">
          <Skeleton className="h-14 w-14 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-coast-line bg-white px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coast-cream text-coast-ink">
          <Icon size={24} strokeWidth={1.8} />
        </span>
      )}
      <p className="font-heading text-[22px] font-bold">{title}</p>
      {children && <p className="mt-2 max-w-sm text-[14px] text-uns-muted">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
