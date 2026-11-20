'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Field from '@/components/ui/Field';
import { formatPrice } from '@/domain/money';
import { PROVINCES, SHIPPING_METHOD_LIST, getShippingMethod, quoteShipping } from '@/services/shipping/shippingMethods';
import { PAYMENT_METHOD_LIST } from '@/services/payments/paymentMethods';

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

function OptionCard({ name, value, checked, onChange, title, description, aside }) {
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
      </span>
    </label>
  );
}

export function CustomerFields({ form, errors, setField }) {
  const bind = (name) => ({ value: form[name], onChange: (e) => setField(name, e.target.value), error: errors[name] });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
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

export function PaymentSelector({ form, errors, config, setField, receiptFile, setReceiptFile }) {
  return (
    <div className="space-y-3">
      {PAYMENT_METHOD_LIST.map((m) => {
        const surcharge = m.surchargePercent(config);
        return (
          <OptionCard
            key={m.id}
            name="payment_method"
            value={m.id}
            checked={form.payment_method === m.id}
            onChange={(v) => setField('payment_method', v)}
            title={m.label}
            description={m.description}
            aside={surcharge ? `+${surcharge}%` : 'Sin recargo'}
          />
        );
      })}

      {form.payment_method === 'transfer' && (
        <div className="fade-up space-y-3 bg-uns-stage p-4 text-[13px] sm:p-5">
          {config?.transfer?.alias && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
              <dt className="text-uns-muted">Titular</dt><dd className="font-bold">{config.transfer.holder}</dd>
              <dt className="text-uns-muted">Alias</dt><dd className="break-all font-bold">{config.transfer.alias}</dd>
              <dt className="text-uns-muted">CBU</dt><dd className="break-all font-bold">{config.transfer.cbu}</dd>
            </dl>
          )}
          <label className="label !mb-0 pt-2" htmlFor="receipt">Comprobante (imagen o PDF)</label>
          <input
            id="receipt"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
            className="block w-full text-[13px] file:mr-3 file:cursor-pointer file:border file:border-black file:bg-white file:px-4 file:py-2.5 file:text-[11px] file:font-bold file:uppercase file:tracking-[0.1em]"
          />
          {receiptFile && <p className="truncate text-uns-muted">Adjunto: {receiptFile.name}</p>}
          {errors.receipt && <p className="text-coast-red-dark" role="alert">{errors.receipt}</p>}
        </div>
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-contain p-1" />}
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">{item.quantity}</span>
          </span>
          <span className="line-clamp-2 min-w-0 flex-1 text-[12px] font-semibold">{item.name}</span>
          <span className="whitespace-nowrap text-[13px] font-bold">{formatPrice(Number(item.final_price) * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}

function Totals({ totals, discount }) {
  const row = (label, value, strong = false) => (
    <div className={`flex justify-between gap-4 ${strong ? 'text-lg font-bold' : 'text-[13px] text-uns-muted'}`}>
      <span>{label}</span>
      <span className={strong ? '' : 'text-black'}>{value}</span>
    </div>
  );
  return (
    <div className="space-y-2 border-t border-uns-hairline pt-4">
      {row('Subtotal', formatPrice(totals.subtotal))}
      {totals.discount > 0 && row(`Descuento ${discount.code || ''}`, `-${formatPrice(totals.discount)}`)}
      {row('Envío', totals.shipping == null ? 'A calcular' : totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping))}
      {totals.surcharge > 0 && row('Recargo tarjeta', formatPrice(totals.surcharge))}
      <div className="pt-2">{row('Total', formatPrice(totals.total), true)}</div>
    </div>
  );
}

/**
 * Resumen plegable arriba del formulario, solo en mobile: el total se ve desde
 * el primer momento sin bajar hasta el final.
 */
export function MobileSummary({ items, totals, discount }) {
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
            <Totals totals={totals} discount={discount} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderSummary({ items, totals, discount, onRedeem, children }) {
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

      <Totals totals={totals} discount={discount} />
      {children}
    </aside>
  );
}
