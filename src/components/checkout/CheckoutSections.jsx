'use client';
import { useState } from 'react';
import Field from '@/components/ui/Field';
import { formatPrice } from '@/domain/money';
import { PROVINCES, SHIPPING_METHOD_LIST, getShippingMethod, quoteShipping } from '@/services/shipping/shippingMethods';
import { PAYMENT_METHOD_LIST } from '@/services/payments/paymentMethods';
import Thumb from '@/components/ui/Thumb';

export function Step({ number, title, children }) {
  return (
    <fieldset className="rounded-2xl border border-coast-line bg-white p-6 sm:p-8">
      <legend className="sr-only">{title}</legend>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coast-ink text-[13px] font-bold text-white">{number}</span>
        <h2 className="font-display text-xl font-extrabold">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}

function OptionCard({ name, value, checked, onChange, title, description, aside }) {
  return (
    <label className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${checked ? 'border-coast-red bg-coast-red-soft/40' : 'border-coast-line hover:border-coast-ink/30'}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="mt-1 accent-coast-red" />
      <span className="flex-1">
        <span className="block text-[14px] font-bold">{title}</span>
        <span className="mt-0.5 block text-[12px] text-coast-gray">{description}</span>
      </span>
      {aside && <span className="text-[13px] font-bold">{aside}</span>}
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
        <div className="grid gap-4 pt-4 sm:grid-cols-2">
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
        <div className="space-y-3 rounded-xl bg-coast-cream-deep p-5 text-[13px]">
          {config?.transfer?.alias && (
            <p>
              Transferí el total a <strong>{config.transfer.holder}</strong> — Alias <strong>{config.transfer.alias}</strong> · CBU{' '}
              <strong className="break-all">{config.transfer.cbu}</strong>
            </p>
          )}
          <label className="label" htmlFor="receipt">Comprobante (imagen o PDF)</label>
          <input id="receipt" type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} className="block text-[13px]" />
          {receiptFile && <p className="text-coast-gray">Adjunto: {receiptFile.name}</p>}
          {errors.receipt && <p className="text-coast-red-dark">{errors.receipt}</p>}
        </div>
      )}
    </div>
  );
}

export function OrderSummary({ items, totals, discount, onRedeem, children }) {
  const [code, setCode] = useState('');
  const row = (label, value, strong = false) => (
    <div className={`flex justify-between ${strong ? 'text-lg font-bold' : 'text-[13px] text-coast-gray'}`}>
      <span>{label}</span>
      <span className={strong ? '' : 'text-coast-ink'}>{value}</span>
    </div>
  );

  return (
    <aside className="rounded-2xl border border-coast-line bg-white p-6 lg:sticky lg:top-24">
      <h2 className="mb-5 font-display text-xl font-extrabold">Tu pedido</h2>
      <ul className="mb-5 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="relative h-14 w-11 shrink-0 rounded-md border border-coast-line bg-white">
              <Thumb src={item.image_url} className="h-full w-full rounded-md object-contain p-1" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-coast-ink text-[10px] font-bold text-white">{item.quantity}</span>
            </span>
            <span className="line-clamp-2 flex-1 text-[12px] font-semibold">{item.name}</span>
            <span className="text-[13px] font-bold">{formatPrice(Number(item.final_price) * item.quantity)}</span>
          </li>
        ))}
      </ul>

      {!discount.code && (
        <div className="mb-5 flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código de descuento" aria-label="Código de descuento" className="input py-2.5 text-[13px]" />
          <button type="button" onClick={() => code && onRedeem(code)} className="border border-coast-ink px-4 text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-coast-ink hover:text-white">
            Aplicar
          </button>
        </div>
      )}

      <div className="space-y-2 border-t border-coast-line pt-4">
        {row('Subtotal', formatPrice(totals.subtotal))}
        {totals.discount > 0 && row(`Descuento ${discount.code || ''}`, `-${formatPrice(totals.discount)}`)}
        {row('Envío', totals.shipping == null ? 'A calcular' : totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping))}
        {totals.surcharge > 0 && row('Recargo tarjeta', formatPrice(totals.surcharge))}
        <div className="pt-2">{row('Total', formatPrice(totals.total), true)}</div>
      </div>
      {children}
    </aside>
  );
}
