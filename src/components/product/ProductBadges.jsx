/**
 * Badges del producto. Mismo formato que el `.badge-box` del tema (caja recta,
 * Roboto Condensed bold itálica, mayúsculas). Los estados de la carta
 * conservan sus colores de semáforo para leerse de un vistazo.
 */

const box = 'badge-box';

export function SaleBadge({ show }) {
  if (!show) return null;
  return <span className={`${box} badge-box--light`}>Rebajado</span>;
}

export function OutletBadge({ show }) {
  if (!show) return null;
  return <span className={`${box} badge-box--outlet`}>Outlet</span>;
}

export function SoldOutBadge({ show }) {
  if (!show) return null;
  return <span className={`${box} badge-box--dark`}>Sin stock</span>;
}

/**
 * Estado de la carta (Mint, NM, LP, MP, Damaged). `detailed` muestra la descripción.
 * En las cards se decide por el ANCHO DE LA CARD (container query en globals.css),
 * no de la pantalla: nombre completo siempre que entre, abreviatura solo en cards angostas.
 */
export function ConditionBadge({ condition, detailed = false }) {
  if (!condition) return null;
  const pill = (
    <span className={`${box} ${condition.tone}`} title={condition.description || condition.label}>
      {detailed ? (
        condition.label
      ) : (
        <>
          <span className="badge-label--abbr">{condition.abbr}</span>
          <span className="badge-label--full">{condition.label}</span>
        </>
      )}
    </span>
  );
  if (!detailed) return pill;
  return (
    <div className="flex items-start gap-3">
      {pill}
      {condition.description && <p className="pt-1 text-[13px] leading-snug text-uns-muted">{condition.description}</p>}
    </div>
  );
}

/** Nota certificada de un slab ("PSA 10"). */
export function CertBadge({ label }) {
  if (!label) return null;
  return <span className={`${box} badge-box--dark`}>{label}</span>;
}

/** Se mantiene para la ficha de producto: porcentaje de descuento. */
export function DiscountBadge({ percent }) {
  if (!percent) return null;
  return <span className={`${box} badge-box--sale`}>-{percent}%</span>;
}

export function LanguageFlag({ language }) {
  if (!language) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={language.flag}
      alt={language.label}
      title={language.label}
      width={24}
      height={18}
      className="h-[16px] w-[22px] object-cover shadow-sm ring-1 ring-black/10"
    />
  );
}

const STOCK = {
  in: { label: 'En stock', dot: 'bg-emerald-500' },
  low: { label: 'Últimas unidades', dot: 'bg-amber-500' },
  out: { label: 'Sin stock', dot: 'bg-uns-border' },
};

export function StockStatus({ status, quantity }) {
  const cfg = STOCK[status] || STOCK.in;
  const showQty = status === 'low' && Number.isFinite(quantity);
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-uns-muted">
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {showQty && ` (${quantity})`}
    </span>
  );
}
