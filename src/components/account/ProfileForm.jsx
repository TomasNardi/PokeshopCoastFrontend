'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { getServices } from '@/services/container';
import { useAsync } from '@/hooks/useAsync';
import { formatDate } from '@/domain/orders';
import { useSession } from '@/components/auth/SessionProvider';
import Field from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import { Card, Collapsible, SectionTitle, Skeleton } from './ui';

const PROVIDERS = { google: 'Google', email: 'email y contraseña', github: 'GitHub' };

export default function ProfileForm() {
  const { user } = useSession();
  const { data: profile, loading, setData } = useAsync(() => getServices().customer.getProfile(), []);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', marketing_opt_in: false });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ first_name: profile.first_name || '', last_name: profile.last_name || '', phone: profile.phone || '', marketing_opt_in: Boolean(profile.marketing_opt_in) });
  }, [profile]);

  const dirty = profile && ['first_name', 'last_name', 'phone', 'marketing_opt_in'].some((k) => (profile[k] ?? '') !== form[k] && !(profile[k] == null && form[k] === ''));
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      setData(await getServices().customer.updateProfile(form));
      toast.success('Perfil actualizado');
    } catch (error) {
      setErrors(error.fieldErrors || {});
      toast.error(error.message || 'No pudimos guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle eyebrow="Mi cuenta" title="Perfil" />
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card as="form" onSubmit={submit} className="p-4 md:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" autoComplete="given-name" value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
            <Field label="Apellido" autoComplete="family-name" value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
            <Field label="Email" value={profile?.email || user?.email || ''} disabled readOnly className="opacity-70" />
            <Field label="Teléfono" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-coast-line p-3 transition-colors hover:bg-uns-bg md:mt-6 md:p-4">
            <span className="toggle mt-0.5">
              <input type="checkbox" checked={form.marketing_opt_in} onChange={set('marketing_opt_in')} />
              <span aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[14px] font-semibold">Quiero recibir novedades</span>
              <span className="block text-[13px] text-uns-muted">Ingresos nuevos, preventas y descuentos. Sin spam.</span>
            </span>
          </label>

          <div className="mt-5 flex items-center gap-4 md:mt-7">
            <button type="submit" disabled={saving || !dirty} className={buttonClass({ size: 'md' })}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {!dirty && <span className="text-[12px] text-coast-mist">Sin cambios</span>}
          </div>
        </Card>

        <Collapsible title="Tu cuenta" defaultOpen={false}>
        <Card className="h-fit p-4 md:p-6">
          <span className="mb-4 hidden h-10 w-10 items-center justify-center rounded-full bg-coast-cream lg:flex"><ShieldCheck size={18} /></span>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between gap-3"><dt className="text-uns-muted">Ingresás con</dt><dd className="font-semibold">{PROVIDERS[profile?.provider || user?.provider] || 'email'}</dd></div>
            {profile?.created_at && <div className="flex justify-between gap-3"><dt className="text-uns-muted">Cliente desde</dt><dd className="font-semibold">{formatDate(profile.created_at)}</dd></div>}
          </dl>
          <p className="mt-4 text-[12px] leading-relaxed text-coast-mist">El email lo maneja tu cuenta de acceso. Para cambiarlo escribinos.</p>
        </Card>
        </Collapsible>
      </div>
    </div>
  );
}
