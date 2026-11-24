'use client';
import { Building2, Check, Home, MapPin, RefreshCw, Store, Truck } from 'lucide-react';
import Field from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/domain/money';
import { BRANCH, HOME, PROVINCES, groupOptions } from '@/services/shipping/shippingMethods';
import { CarrierMark } from './Brands';
import PickupMap from '@/components/shipping/PickupMap';

function Tabs({ value, onChange }) {
  const tab = (id, label, Icon) => (
    <button
      type="button"
      role="radio"
      aria-checked={value === id}
      onClick={() => onChange(id)}
      className={`flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-2.5 text-center text-[11px] font-bold uppercase leading-tight tracking-[0.06em] transition-colors duration-300 min-[420px]:flex-row min-[420px]:gap-2 min-[420px]:py-3 sm:text-[12px] sm:tracking-[0.1em] ${
        value === id ? 'bg-black text-white' : 'text-uns-muted hover:text-black'
      }`}
    >
      <Icon size={16} strokeWidth={2} className="shrink-0" />
      <span className="min-w-0">{label}</span>
    </button>
  );
  return (
    <div role="radiogroup" aria-label="Cómo recibís tu pedido" className="grid grid-cols-2 border border-black">
      {tab('ship', 'Envío', Truck)}
      {tab('pickup', 'Retiro en persona', Store)}
    </div>
  );
}

function SavedAddresses({ shipping }) {
  if (!shipping.addresses.length) return null;
  const card = (key, checked, onPick, title, text) => (
    <label key={key} className={`flex cursor-pointer items-start gap-3 border p-3.5 transition-colors duration-300 ${checked ? 'border-black bg-uns-stage' : 'border-uns-hairline hover:border-black/40'}`}>
      <input type="radio" name="saved_address" checked={checked} onChange={onPick} className="mt-0.5 h-4 w-4 shrink-0 accent-black" />
      <span className="min-w-0">
        <span className="block text-[13px] font-bold">{title}</span>
        {text && <span className="mt-0.5 block text-[12px] leading-snug text-uns-muted">{text}</span>}
      </span>
    </label>
  );
  return (
    <div className="space-y-2">
      <p className="label">Tus direcciones</p>
      {shipping.addresses.map((a) => card(
        a.id, shipping.addressId === a.id, () => shipping.selectAddress(a),
        a.label || [a.address, a.street_number].filter(Boolean).join(' '),
        [[a.address, a.street_number].filter(Boolean).join(' '), a.apartment, `${a.city}, ${a.province} (${a.zip_code})`].filter(Boolean).join(' · '),
      ))}
      {card('new', shipping.addressId === 'new', () => shipping.selectAddress('new'), 'Usar otra dirección')}
    </div>
  );
}

function AddressFields({ form, errors, bind, shipping, loggedIn }) {
  const editing = shipping.addressId === 'new' || !shipping.addresses.length;
  if (!editing) return null;
  return (
    <div className="fade-up grid gap-4 sm:grid-cols-6">
      <Field as="select" label="Provincia" className="sm:col-span-3" autoComplete="address-level1" {...bind('shipping_province')}>
        <option value="">Elegí una provincia</option>
        {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
      </Field>
      <Field label="Código postal" className="sm:col-span-3" inputMode="numeric" maxLength={4} autoComplete="postal-code" placeholder="Ej: 7600" {...bind('shipping_zip')} />
      <Field label="Ciudad / localidad" className="sm:col-span-6" autoComplete="address-level2" {...bind('shipping_city')} />
      <Field label="Calle" className="sm:col-span-3" autoComplete="address-line1" {...bind('shipping_address')} />
      <Field label="Número" className="sm:col-span-1" inputMode="numeric" {...bind('shipping_street_number')} />
      <Field label="Piso / depto (opcional)" className="sm:col-span-2" autoComplete="address-line2" {...bind('shipping_apartment')} />
      {loggedIn && (
        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] sm:col-span-6">
          <input type="checkbox" checked={shipping.saveAddress} onChange={(e) => shipping.setSaveAddress(e.target.checked)} className="h-4 w-4 accent-black" />
          Guardar esta dirección en mi cuenta
        </label>
      )}
    </div>
  );
}

function PriceTag({ price, free }) {
  if (free) {
    return (
      <span className="flex flex-col items-end leading-tight">
        <s className="text-[11px] font-normal text-uns-muted">{formatPrice(price)}</s>
        <span className="text-[14px] font-bold text-emerald-700">Gratis</span>
      </span>
    );
  }
  return <span className="whitespace-nowrap text-[14px] font-bold">{formatPrice(price)}</span>;
}

function OptionRow({ option, checked, onPick, free }) {
  return (
    <label className={`flex min-h-[64px] cursor-pointer items-center gap-3 border p-3.5 transition-colors duration-300 sm:gap-4 sm:p-4 ${checked ? 'border-black bg-uns-stage' : 'border-uns-hairline hover:border-black/40'}`}>
      <input type="radio" name="shipping_option" checked={checked} onChange={onPick} className="h-4 w-4 shrink-0 accent-black" />
      <CarrierMark carrier={option.carrier} name={option.carrier_name} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14px] font-bold leading-snug">{option.carrier_name}</span>
          {option.cheapest && <span className="badge-box badge-box--dark">Más barato</span>}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-uns-muted">
          {[option.service_name, option.eta && `Llega en ${option.eta}`].filter(Boolean).join(' · ')}
        </span>
      </span>
      <PriceTag price={option.price} free={free} />
    </label>
  );
}

function OptionsSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Cotizando envíos">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 border border-uns-hairline p-4">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-[6px]" />
          <span className="flex-1 space-y-2"><Skeleton className="block h-3.5 w-40" /><Skeleton className="block h-3 w-56 max-w-full" /></span>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

function Branches({ shipping, form, errors }) {
  const { branches } = shipping;
  return (
    <div className="fade-up space-y-2 border-l-2 border-black pl-4">
      <p className="label">¿En qué sucursal lo retirás?</p>
      {branches.status === 'loading' && <Skeleton className="block h-12 w-full" />}
      {branches.status === 'error' && <p className="text-[13px] text-coast-red-dark">{branches.error}</p>}
      {branches.status === 'ready' && !branches.list.length && (
        <p className="text-[13px] text-uns-muted">No encontramos sucursales de este correo cerca de tu código postal. Elegí otra opción.</p>
      )}
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {branches.list.map((b) => (
          <label key={b.code} className={`flex cursor-pointer items-start gap-3 border p-3 transition-colors duration-300 ${form.shipping_branch_code === b.code ? 'border-black bg-uns-stage' : 'border-uns-hairline hover:border-black/40'}`}>
            <input type="radio" name="shipping_branch" checked={form.shipping_branch_code === b.code} onChange={() => shipping.selectBranch(b)} className="mt-0.5 h-4 w-4 shrink-0 accent-black" />
            <MapPin size={16} className="mt-0.5 shrink-0 text-uns-muted" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">{b.name}</span>
              <span className="block text-[12px] text-uns-muted">{[b.address, b.city].filter(Boolean).join(', ')}</span>
            </span>
            {b.distance_km != null && <span className="whitespace-nowrap text-[11px] font-bold text-uns-muted">{b.distance_km} km</span>}
          </label>
        ))}
      </div>
      {errors.shipping_branch_code && <p className="text-[12px] text-coast-red-dark" role="alert">{errors.shipping_branch_code}</p>}
    </div>
  );
}

function ShippingOptions({ shipping, form, errors, freeShipping }) {
  const { quotes, selected } = shipping;
  if (!shipping.canQuote) {
    return (
      <p className="flex items-center gap-2 bg-uns-stage p-4 text-[13px] text-uns-muted">
        <Truck size={16} className="shrink-0" /> Completá provincia, ciudad y código postal para ver las opciones y el costo de envío.
      </p>
    );
  }
  if (quotes.status === 'loading' && !quotes.options.length) return <OptionsSkeleton />;
  if (quotes.status === 'error') {
    return (
      <div className="border border-coast-red/40 bg-coast-red/5 p-4 text-[13px]" role="alert">
        <p className="text-coast-red-dark">{quotes.error}</p>
        <button type="button" onClick={shipping.retry} className="mt-2 inline-flex items-center gap-1.5 font-bold underline underline-offset-2">
          <RefreshCw size={13} /> Volver a cotizar
        </button>
      </div>
    );
  }
  const groups = groupOptions(quotes.options);
  const free = Boolean(freeShipping?.applies);
  const section = (kind, title, Icon) => groups[kind].length > 0 && (
    <div key={kind} className="space-y-2">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-uns-muted"><Icon size={14} /> {title}</p>
      {groups[kind].map((o) => (
        <OptionRow key={o.token} option={o} checked={selected?.token === o.token} onPick={() => shipping.select(o)} free={free} />
      ))}
    </div>
  );
  return (
    <div className={`space-y-5 transition-opacity duration-300 ${quotes.status === 'loading' ? 'opacity-60' : ''}`} aria-busy={quotes.status === 'loading'}>
      {section(HOME, 'A domicilio', Home)}
      {section(BRANCH, 'Retiro en sucursal del correo', Building2)}
      {selected?.kind === BRANCH && <Branches shipping={shipping} form={form} errors={errors} />}
      {errors.shipping_quote && <p className="text-[12px] text-coast-red-dark" role="alert">{errors.shipping_quote}</p>}
    </div>
  );
}

export default function ShippingStep({ form, errors, setField, shipping, freeShipping, loggedIn }) {
  const bind = (name) => ({ value: form[name] || '', onChange: (e) => setField(name, e.target.value), error: errors[name] });
  return (
    <div className="space-y-5">
      <Tabs value={shipping.delivery} onChange={shipping.setDelivery} />
      {shipping.delivery === 'pickup' ? (
        <div className="fade-up space-y-3">
          <div className="flex items-start gap-3 bg-uns-stage p-4 text-[13px] leading-relaxed">
            <Check size={18} className="mt-0.5 shrink-0 text-emerald-700" />
            <p><strong>Sin costo.</strong> Retirás en Santa Clara del Mar, coordinando antes día y horario por WhatsApp. Te escribimos apenas esté listo.</p>
          </div>
          <PickupMap />
        </div>
      ) : (
        <>
          <SavedAddresses shipping={shipping} />
          <AddressFields form={form} errors={errors} bind={bind} shipping={shipping} loggedIn={loggedIn} />
          <div className="space-y-3 border-t border-uns-hairline pt-5">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.12em]">Método de envío</h3>
            <ShippingOptions shipping={shipping} form={form} errors={errors} freeShipping={freeShipping} />
          </div>
        </>
      )}
      {errors.shipping_method && <p className="text-[12px] text-coast-red-dark" role="alert">{errors.shipping_method}</p>}
    </div>
  );
}
