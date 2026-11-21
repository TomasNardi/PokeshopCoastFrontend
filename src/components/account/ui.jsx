/**
 * Piezas visuales del panel de cuenta: tarjeta, título de sección, estado,
 * progreso del pedido, esqueletos y vacío. Todo con la paleta del sitio.
 */
'use client';
import { useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { orderStatus, orderSteps } from '@/domain/orders';
import { LoadingRegion, Skeleton } from '@/components/ui/Skeleton';

export function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-2xl border border-coast-line bg-white ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5 hidden lg:block">{eyebrow}</p>}
        <h2 className="font-heading text-[22px] font-bold leading-none md:text-[30px]">{title}</h2>
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

  // Cada paso es una columna igual con el punto centrado; la línea va del
  // centro del primer punto al del último (medio ancho de columna de cada lado).
  const inset = `calc(100% / ${steps.length * 2})`;

  return (
    <div className={`relative ${compact ? '' : 'pt-1'}`}>
      {/* z-0: la línea queda debajo de los puntos (antes, al ser absolute, se pintaba encima del check). */}
      <div className="absolute z-0 h-[3px] rounded-full bg-coast-line" style={{ left: inset, right: inset, top: compact ? 8 : 12 }} aria-hidden="true">
        <div className="progress-fill absolute inset-y-0 left-0 rounded-full bg-coast-red" style={{ '--progress': `${percent}%` }} />
      </div>
      <ol className="relative z-10 grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((label, index) => {
          const done = index <= step;
          const current = index === step;
          return (
            <li key={label} className="flex min-w-0 flex-col items-center px-0.5 text-center" aria-current={current ? 'step' : undefined}>
              <span
                className={`progress-dot flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                  done ? 'border-coast-red bg-coast-red text-white' : 'border-coast-line bg-white'
                } ${current ? 'is-current' : ''}`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {done && <Check size={11} strokeWidth={3.5} />}
              </span>
              {!compact && (
                <span className={`mt-2 text-[10px] font-semibold uppercase leading-tight tracking-[0.04em] sm:text-[11px] sm:tracking-[0.06em] ${done ? 'text-coast-ink' : 'text-coast-mist'}`}>{label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export { Skeleton };

export function SkeletonRows({ rows = 3, label = 'Cargando' }) {
  return (
    <LoadingRegion label={label} className="space-y-3">
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
    </LoadingRegion>
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

/**
 * Bloque desplegable en celular/tablet; en escritorio (lg) siempre abierto y
 * el encabezado es un título común. Menos scroll en pantallas chicas.
 */
export function Collapsible({ title, meta, action, defaultOpen = true, className = '', bodyClassName = '', children }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className={className}>
      <div className="mb-2.5 flex items-center justify-between gap-3 lg:mb-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left lg:pointer-events-none"
        >
          <span className="font-heading text-[18px] font-bold leading-none lg:text-[24px]">{title}</span>
          {meta != null && meta !== false && <span className="text-[12px] font-semibold text-uns-muted">{meta}</span>}
          <ChevronDown size={16} className={`ml-auto shrink-0 text-coast-mist transition-transform duration-300 lg:hidden ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {action && <div className="hidden shrink-0 lg:block">{action}</div>}
      </div>
      <div id={id} className={`${open ? '' : 'hidden'} lg:block ${bodyClassName}`}>
        {children}
        {action && <div className="mt-2 lg:hidden">{action}</div>}
      </div>
    </section>
  );
}
