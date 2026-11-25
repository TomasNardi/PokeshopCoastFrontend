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
    <div className="flex items-center gap-3">
      <span className="shrink-0">{pill}</span>
      {condition.description && <p className="text-[13px] leading-snug text-uns-muted">{condition.description}</p>}
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

/** En las cards de celular entran estas; el resto se resume en "+N". */
const MOBILE_VISIBLE = 2;

/**
 * Reverse Holo, 1st Edition, firmada, estampada… como ícono (TCG Fans). Solo
 * las que aplican, siempre en el mismo orden y tamaño. `withLabel`: con el
 * nombre al lado (ficha del producto).
 */
export function TraitBadges({ badges, withLabel = false }) {
  if (!badges?.length) return null;
  const hidden = badges.slice(MOBILE_VISIBLE);
  return (
    <span className={`trait-badges ${withLabel ? 'trait-badges--labeled' : ''}`}>
      {badges.map((b, i) => (
        <span key={b.key} className={`trait-badge ${i >= MOBILE_VISIBLE ? 'is-extra' : ''}`} title={b.label}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.icon} alt={withLabel ? '' : b.label} width={18} height={18} />
          {/* En la card: el nombre aparece al pasar el mouse (solo PC, ver globals.css). */}
          {withLabel ? <span>{b.label}</span> : <span className="trait-badge__label" aria-hidden="true">{b.label}</span>}
        </span>
      ))}
      {!withLabel && hidden.length > 0 && (
        <span className="trait-more" title={hidden.map((b) => b.label).join(', ')} aria-hidden="true">
          +{hidden.length}
        </span>
      )}
    </span>
  );
}

/**
 * "Holofoil" con brillo: un reflejo que cruza la etiqueta cada tanto, como la
 * carta al moverla. Va junto al nombre (card y ficha), no sobre la foto.
 */
export function HolofoilTag({ show, large = false }) {
  if (!show) return null;
  return (
    <span className={`holo-tag ${large ? 'holo-tag--large' : ''}`} title="Carta holo: la ilustración brilla">
      <svg className="holo-tag__spark" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 0c.4 3.9 2.1 6.6 8 8-5.9 1.4-7.6 4.1-8 8-.4-3.9-2.1-6.6-8-8 5.9-1.4 7.6-4.1 8-8z" />
      </svg>
      Holofoil
    </span>
  );
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
