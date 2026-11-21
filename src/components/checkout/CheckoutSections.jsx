'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import Field from '@/components/ui/Field';
import { formatPrice } from '@/domain/money';
import { PROVINCES, SHIPPING_METHOD_LIST, getShippingMethod, quoteShipping } from '@/services/shipping/shippingMethods';
import Thumb from '@/components/ui/Thumb';

export function Step({ number, title, children, delay = 0 }) {
  return (
    <fieldset className="fade-up min-w-0 border border-uns-hairline bg-white p-5 sm:p-8" style={{ '--delay': `${delay}s` }}>
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-center gap-3 sm:mb-6">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[12px] font-bold text-white">{number}</span>
        <h2 className="font-heading text-[20px] font-bold uppercase leading-none sm:text-[22px]">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}

function OptionCard({ name, value, checked, onChange, title, description, aside, badge }) {
  return (
    <label
      className={`flex min-h-[56px] cursor-pointer items-start gap-3 border p-4 transition-colors duration-300 sm:gap-4 ${
        checked ? 'border-black bg-uns-stage' : 'border-uns-hairline hover:border-black/40'
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="mt-0.5 h-4 w-4 shrink-0 accent-black" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="text-[14px] font-bold leading-snug">{title}</span>
          {aside && <span className="whitespace-nowrap text-[13px] font-bold">{aside}</span>}
        </span>
        <span className="mt-1 block text-[12px] leading-snug text-uns-muted">{description}</span>
        {badge}
      </span>
    </label>
  );
}

/**
 * Diferencia entre medios de pago (la lógica de Crack con los badges del
 * sitio: caja recta, itálica, mayúsculas; blanco y negro como unsobremas).
 */
function PriceBadge({ tone, label, children }) {
  return (
    <span className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <span className={`badge-box ${tone === 'saving' ? 'badge-box--dark' : 'border border-black bg-white text-black'}`}>{label}</span>
      <span className={`text-[12px] ${tone === 'saving' ? 'font-bold text-black' : 'text-uns-muted'}`}>{children}</span>
    </span>
  );
}

export function CustomerFields({ form, errors, setField, guest = false }) {
  const bind = (name) => ({ value: form[name], onChange: (e) => setField(name, e.target.value), error: errors[name] });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {guest && (
        <p className="sm:col-span-2 -mt-1 text-[13px] text-uns-muted">
          ¿Tenés cuenta?{' '}
          <Link href="/cuenta/ingresar?next=/checkout" className="font-bold text-coast-ink underline underline-offset-2">Ingresá</Link>
          {' '}y seguí tu pedido desde Mi cuenta. También podés comprar como invitado.
        </p>
      )}
      <Field label="Nombre y apellido" autoComplete="name" className="sm:col-span-2" {...bind('customer_name')} />
      <Field label="Email" type="email" autoComplete="email" {...bind('customer_email')} />
      <Field label="Teléfono / WhatsApp" type="tel" autoComplete="tel" {...bind('customer_phone')} />
    </div>
  );
}

export function ShippingSelector({ form, errors, config, setField, setShipping }) {
  const method = getShippingMethod(form.shipping_method);
  const bind = (name) => ({ value: form[name], onChange: (e) => setField(name, e.target.value), error: errors[name] });
  const priceLabel = (id) => {
    const m = getShippingMethod(id);
    if (!m.needsAddress) return 'Gratis';
    const price = quoteShipping(id, form, config);
    return price == null ? 'Según provincia' : formatPrice(price);
  };

  return (
    <div className="space-y-3">
      {SHIPPING_METHOD_LIST.map((m) => (
        <OptionCard
          key={m.id}
          name="shipping_method"
          value={m.id}
          checked={form.shipping_method === m.id}
          onChange={setShipping}
          title={m.label}
          description={m.description}
          aside={priceLabel(m.id)}
        />
      ))}
      {errors.shipping_method && <p className="text-[12px] text-coast-red-dark">{errors.shipping_method}</p>}

      {method?.needsAddress && (
        <div className="fade-up grid gap-4 pt-4 sm:grid-cols-2">
          <Field as="select" label="Provincia" {...bind('shipping_province')}>
            <option value="">Elegí una provincia</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Field>
          <Field label="Ciudad" autoComplete="address-level2" {...bind('shipping_city')} />
          <Field label={method.addressLabel} autoComplete="street-address" className="sm:col-span-2" {...bind('shipping_address')} />
          <Field label="Código postal" inputMode="numeric" maxLength={4} autoComplete="postal-code" {...bind('shipping_zip')} />
        </div>
      )}
    </div>
  );
}

export function PaymentSelector({ form, errors, methods, totals, setField }) {
  // El precio publicado es el de transferencia; MP suma el recargo del
  // backoffice solo sobre los productos. Si el recargo está apagado o hay un
  // solo medio activo, no hay diferencia que mostrar.
  const percent = totals?.cardSurchargePercent || 0;
  const difference = totals?.cardSurcharge || 0;
  const badgeFor = (id) => {
    if (!percent || !difference) return null;
    if (id === 'mercadopago') {
      return (
        <PriceBadge tone="surcharge" label={`+${percent}% recargo`}>
          Suma {formatPrice(difference)} a los productos
        </PriceBadge>
      );
    }
    return (
      <PriceBadge tone="saving" label="Sin recargo">
        Ahorrás {formatPrice(difference)}
      </PriceBadge>
    );
  };

  return (
    <div className="space-y-3">
      {methods.map((m) => (
        <OptionCard
          key={m.id}
          name="payment_method"
          value={m.id}
          checked={form.payment_method === m.id}
          onChange={(v) => setField('payment_method', v)}
          title={m.label}
          description={m.description}
          badge={badgeFor(m.id)}
        />
      ))}
      {errors.payment_method && <p className="text-[12px] text-coast-red-dark" role="alert">{errors.payment_method}</p>}

      {form.payment_method === 'transfer' && (
        <p className="fade-up bg-uns-stage p-4 text-[13px] leading-relaxed text-uns-muted sm:p-5">
          Al confirmar te mostramos los datos para transferir y ahí subís el comprobante. Recién entonces se genera tu pedido.
        </p>
      )}
    </div>
  );
}

function SummaryLines({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className="relative h-14 w-11 shrink-0 bg-uns-stage">
            <Thumb src={item.image_url} className="h-full w-full object-contain p-1" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">{item.quantity}</span>
          </span>
          <span className="line-clamp-2 min-w-0 flex-1 text-[12px] font-semibold">{item.name}</span>
          <span className="whitespace-nowrap text-[13px] font-bold">{formatPrice(Number(item.final_price) * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}

function Totals({ totals, discount, paymentMethod }) {
  const row = (label, value, strong = false) => (
    <div className={`flex justify-between gap-4 ${strong ? 'text-lg font-bold' : 'text-[13px] text-uns-muted'}`}>
      <span>{label}</span>
      <span className={strong ? '' : 'text-black'}>{value}</span>
    </div>
  );
  const compare = totals.cardSurcharge > 0;
  return (
    <div className="space-y-2 border-t border-uns-hairline pt-4">
      {row('Subtotal', formatPrice(totals.subtotal))}
      {totals.discount > 0 && row(`Descuento ${discount.code || ''}`, `-${formatPrice(totals.discount)}`)}
      {totals.surcharge > 0 && row(`Recargo Mercado Pago (${totals.surchargePercent}%)`, `+${formatPrice(totals.surcharge)}`)}
      {row('Envío', totals.shipping == null ? 'A calcular' : totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping))}
      <div className="pt-2">
        {row('Total', formatPrice(totals.total), true)}
        {/* El total con el otro medio, para que se vea la diferencia (como Crack). */}
        {compare && (
          <div className="mt-2 flex justify-between gap-4 border-t border-dashed border-uns-hairline pt-2 text-[12px] text-uns-muted">
            <span>{paymentMethod === 'mercadopago' ? 'Pagando por transferencia' : 'Pagando con Mercado Pago'}</span>
            <span className="whitespace-nowrap font-bold text-black">
              {formatPrice(paymentMethod === 'mercadopago' ? totals.transferTotal : totals.cardTotal)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Resumen plegable arriba del formulario, solo en mobile: el total se ve desde
 * el primer momento sin bajar hasta el final.
 */
export function MobileSummary({ items, totals, discount, paymentMethod }) {
  const [open, setOpen] = useState(false);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  return (
    <div className="fade-up border border-uns-hairline bg-white lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em]">
          {open ? 'Ocultar' : 'Ver'} resumen ({count})
          <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </span>
        <span className="text-[16px] font-bold">{formatPrice(totals.total)}</span>
      </button>
      <div className={`collapse-rows ${open ? 'is-open' : ''}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 px-5 pb-5">
            <SummaryLines items={items} />
            <Totals totals={totals} discount={discount} paymentMethod={paymentMethod} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderSummary({ items, totals, discount, paymentMethod, onRedeem, children }) {
  const [code, setCode] = useState('');
  const redeem = () => code.trim() && onRedeem(code.trim());

  return (
    <aside className="fade-up min-w-0 border border-uns-hairline bg-white p-5 sm:p-6 lg:sticky lg:top-24" style={{ '--delay': '0.15s' }}>
      <h2 className="mb-5 font-heading text-[20px] font-bold uppercase leading-none sm:text-[22px]">Tu pedido</h2>
      <div className="mb-5">
        <SummaryLines items={items} />
      </div>

      {!discount.code && (
        <div className="mb-5 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                redeem();
              }
            }}
            placeholder="Código de descuento"
            aria-label="Código de descuento"
            className="input min-w-0 py-2.5"
          />
          <button type="button" onClick={redeem} className="shrink-0 border border-black px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 hover:bg-black hover:text-white">
            Aplicar
          </button>
        </div>
      )}

      <Totals totals={totals} discount={discount} paymentMethod={paymentMethod} />
      {children}
    </aside>
  );
}
