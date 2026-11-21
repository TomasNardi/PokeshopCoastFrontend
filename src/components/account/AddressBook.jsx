'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Home, MapPin, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { getServices } from '@/services/container';
import { useAsync } from '@/hooks/useAsync';
import { PROVINCES } from '@/services/shipping/shippingMethods';
import Field from '@/components/ui/Field';
import Button, { buttonClass } from '@/components/ui/Button';
import { Card, EmptyState, SectionTitle, SkeletonRows } from './ui';

const KINDS = { home: { label: 'Domicilio', Icon: Home }, branch: { label: 'Sucursal de correo', Icon: MapPin } };
const EMPTY = { kind: 'home', label: '', recipient_name: '', phone: '', address: '', city: '', province: 'Buenos Aires', zip_code: '', branch_name: '', is_default: false };

function validate(form) {
  const errors = {};
  if (!form.address.trim()) errors.address = 'Completá la dirección.';
  if (!form.city.trim()) errors.city = 'Completá la ciudad.';
  if (!/^\d{4}$/.test(form.zip_code.trim())) errors.zip_code = 'El código postal tiene 4 dígitos.';
  return errors;
}

function AddressForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const { customer } = getServices();
      const { id, ...data } = form;
      const saved = id ? await customer.updateAddress(id, data) : await customer.createAddress(data);
      toast.success(id ? 'Dirección actualizada' : 'Dirección guardada');
      onSaved(saved);
    } catch (error) {
      setErrors(error.fieldErrors || {});
      toast.error(error.message || 'No pudimos guardar la dirección.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="form" onSubmit={submit} className="form-reveal p-4 md:p-6" noValidate>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-heading text-[22px] font-bold">{form.id ? 'Editar dirección' : 'Nueva dirección'}</p>
        <button type="button" onClick={onCancel} className="header-icon -mr-2" aria-label="Cerrar"><X size={18} /></button>
      </div>

      <div role="radiogroup" className="mb-5 grid grid-cols-2 rounded-full bg-coast-cream-deep p-1">
        {Object.entries(KINDS).map(([kind, { label }]) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={form.kind === kind}
            onClick={() => setForm((f) => ({ ...f, kind }))}
            className={`rounded-full py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${form.kind === kind ? 'bg-white shadow-sm' : 'text-coast-gray'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre (opcional)" placeholder="Casa, Trabajo…" value={form.label} onChange={set('label')} />
        <Field label="Quién recibe" value={form.recipient_name} onChange={set('recipient_name')} />
        {form.kind === 'branch' && <Field className="sm:col-span-2" label="Sucursal" placeholder="Correo Argentino — Sucursal Centro" value={form.branch_name} onChange={set('branch_name')} />}
        <Field className="sm:col-span-2" label={form.kind === 'branch' ? 'Dirección de la sucursal' : 'Dirección (calle, número, piso)'} value={form.address} onChange={set('address')} error={errors.address} />
        <Field label="Ciudad" value={form.city} onChange={set('city')} error={errors.city} />
        <Field as="select" label="Provincia" value={form.province} onChange={set('province')} error={errors.province}>
          {PROVINCES.map((p) => <option key={p}>{p}</option>)}
        </Field>
        <Field label="Código postal" inputMode="numeric" maxLength={4} value={form.zip_code} onChange={set('zip_code')} error={errors.zip_code} />
        <Field label="Teléfono (opcional)" type="tel" value={form.phone} onChange={set('phone')} />
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px]">
        <input type="checkbox" checked={form.is_default} onChange={set('is_default')} className="h-4 w-4 accent-coast-red" />
        Usar como predeterminada para {KINDS[form.kind].label.toLowerCase()}
      </label>

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className={buttonClass({ size: 'md' })}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  );
}

function AddressCard({ address, onEdit, onDelete, onDefault, style }) {
  const { Icon, label } = KINDS[address.kind] || KINDS.home;
  return (
    <Card style={style} className={`group relative flex flex-col p-4 transition-all duration-300 hover:shadow-card md:p-5 ${address.is_default ? 'border-coast-ink/40' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-uns-muted">
          <Icon size={14} /> {label}
        </span>
        {address.is_default && (
          <span className="inline-flex items-center gap-1 rounded-full bg-coast-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
            <Star size={10} fill="currentColor" /> Predeterminada
          </span>
        )}
      </div>
      <p className="font-heading text-[17px] font-bold leading-tight md:text-[20px]">{address.label || address.branch_name || address.address}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-uns-muted">
        {address.branch_name && address.label && <>{address.branch_name}<br /></>}
        {address.address}<br />
        {address.city}, {address.province} ({address.zip_code})
        {address.recipient_name && <><br />Recibe: {address.recipient_name}</>}
      </p>
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-3 text-[11px] font-bold uppercase tracking-[0.075em] md:pt-5 md:text-[12px]">
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 hover:text-coast-red"><Pencil size={13} /> Editar</button>
        {!address.is_default && <button type="button" onClick={onDefault} className="inline-flex items-center gap-1.5 hover:text-coast-red"><Star size={13} /> Predeterminar</button>}
        <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-uns-muted hover:text-coast-red-dark"><Trash2 size={13} /> Borrar</button>
      </div>
    </Card>
  );
}

export default function AddressBook() {
  const { data, loading, reload } = useAsync(() => getServices().customer.getAddresses(), []);
  const [editing, setEditing] = useState(null); // null | {} (nueva) | address
  const addresses = Array.isArray(data) ? data : [];

  const remove = async (address) => {
    if (!window.confirm(`¿Borrar "${address.label || address.address}"?`)) return;
    try {
      await getServices().customer.deleteAddress(address.id);
      toast.success('Dirección borrada');
      reload();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const makeDefault = async (address) => {
    try {
      await getServices().customer.updateAddress(address.id, { is_default: true });
      reload();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <SectionTitle
        eyebrow="Mi cuenta"
        title="Direcciones"
        action={!editing && <Button size="sm" onClick={() => setEditing({})}><Plus size={14} /> Agregar</Button>}
      />
      <p className="-mt-2 mb-4 max-w-xl text-[13px] text-uns-muted md:mb-6 md:text-[14px]">Guardá tu casa y tu sucursal de correo: en el checkout se completan solas según el envío que elijas.</p>

      {editing && (
        <div className="mb-6">
          <AddressForm
            key={editing.id || 'new'}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </div>
      )}

      {loading ? (
        <SkeletonRows rows={2} />
      ) : addresses.length === 0 && !editing ? (
        <EmptyState icon={MapPin} title="Sin direcciones guardadas" action={<Button onClick={() => setEditing({})}><Plus size={14} /> Agregar dirección</Button>}>
          Agregá una y comprás más rápido la próxima vez.
        </EmptyState>
      ) : (
        <div className="stagger grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setEditing(address)}
              onDelete={() => remove(address)}
              onDefault={() => makeDefault(address)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
