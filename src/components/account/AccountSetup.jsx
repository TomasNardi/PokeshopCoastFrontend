'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, MapPin, Phone, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { getServices } from '@/services/container';

/**
 * "Terminá de configurar tu cuenta": solo lo clave para comprar sin fricción
 * (nombre, teléfono y una dirección). El estado sale de los datos reales del
 * backend (`profile.setup`) y "Ocultar" se guarda en la base, así no vuelve en
 * otro dispositivo. Nombre y teléfono se completan acá mismo; la dirección
 * abre el formulario en Direcciones.
 */
const STEPS = {
  name: { Icon: UserRound, title: 'Nombre y apellido', why: 'Para tus pedidos y envíos.' },
  phone: { Icon: Phone, title: 'Teléfono', why: 'Para contactarte si hace falta coordinar algo de tu pedido.' },
  address: { Icon: MapPin, title: 'Dirección de envío', why: 'Tu casa o sucursal: el checkout se completa solo.' },
};

function InlineForm({ step, profile, onSaved }) {
  const [values, setValues] = useState({ first_name: profile.first_name || '', last_name: profile.last_name || '', phone: profile.phone || '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => { setValues((v) => ({ ...v, [key]: e.target.value })); setError(''); };

  const submit = async (event) => {
    event.preventDefault();
    const data = step === 'name' ? { first_name: values.first_name.trim(), last_name: values.last_name.trim() } : { phone: values.phone.trim() };
    if (step === 'name' && (!data.first_name || !data.last_name)) return setError('Completá nombre y apellido.');
    if (step === 'phone' && data.phone.replace(/\D/g, '').length < 8) return setError('Ingresá un teléfono válido (con característica).');
    setSaving(true);
    try {
      onSaved(await getServices().customer.updateProfile(data));
    } catch (err) {
      setError(err.fieldErrors?.phone || err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const input = 'h-10 min-w-0 flex-1 rounded-lg border border-coast-line bg-white px-3 text-[14px] outline-none focus:border-coast-ink';
  return (
    <form onSubmit={submit} className="mt-2.5" noValidate>
      <div className="flex flex-wrap gap-2">
        {step === 'name' ? (
          <>
            <input className={input} placeholder="Nombre" autoComplete="given-name" value={values.first_name} onChange={set('first_name')} aria-label="Nombre" autoFocus />
            <input className={input} placeholder="Apellido" autoComplete="family-name" value={values.last_name} onChange={set('last_name')} aria-label="Apellido" />
          </>
        ) : (
          <input className={input} type="tel" inputMode="tel" placeholder="Ej. 2257 55-4759" autoComplete="tel" value={values.phone} onChange={set('phone')} aria-label="Teléfono" autoFocus />
        )}
        <button type="submit" disabled={saving} className="h-10 shrink-0 rounded-lg bg-coast-ink px-4 text-[12px] font-bold uppercase tracking-[0.06em] text-white disabled:opacity-60">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[12px] font-semibold text-coast-red-dark" role="alert">{error}</p>}
    </form>
  );
}

export default function AccountSetup() {
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(null); // paso con el formulario abierto
  const [justFinished, setJustFinished] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let alive = true;
    getServices().customer.getProfile().then((p) => alive && setProfile(p)).catch(() => {});
    return () => { alive = false; };
  }, []);

  const setup = profile?.setup;
  if (gone || !setup) return null;
  if ((setup.is_complete || setup.dismissed) && !justFinished) return null;

  const onSaved = (updated) => {
    setOpen(null);
    setProfile(updated);
    if (updated?.setup?.is_complete) {
      setJustFinished(true);
      setTimeout(() => setGone(true), 4000);
    } else {
      toast.success('Guardado');
    }
  };

  const dismiss = async () => {
    setGone(true);
    try {
      await getServices().customer.updateProfile({ setup_dismissed: true });
      toast('Lo podés completar cuando quieras desde Perfil y Envíos.');
    } catch {
      /* si falla, vuelve a aparecer la próxima vez: no es grave */
    }
  };

  if (justFinished) {
    return (
      <section className="setup-card is-done fade-up flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4" role="status">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"><Check size={18} strokeWidth={3} /></span>
        <div>
          <p className="text-[14px] font-bold text-emerald-900">¡Tu cuenta está lista!</p>
          <p className="text-[12px] text-emerald-800/80">La próxima compra se completa sola.</p>
        </div>
      </section>
    );
  }

  const percent = Math.round((setup.completed / setup.total) * 100);
  const pending = setup.total - setup.completed;

  return (
    <section aria-labelledby="setup-title" className="setup-card fade-up rounded-2xl border border-coast-line bg-white">
      <header className="flex items-start justify-between gap-3 p-4 pb-3 md:p-5 md:pb-3">
        <div className="min-w-0">
          <h2 id="setup-title" className="font-heading text-[18px] font-bold leading-tight md:text-[22px]">Terminá de configurar tu cuenta</h2>
          <p className="mt-0.5 text-[12px] text-uns-muted">
            {pending === 1 ? 'Te falta 1 paso' : `Te faltan ${pending} pasos`} para comprar en un toque.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-coast-cream px-2.5 py-1 text-[12px] font-bold tabular-nums">{setup.completed}/{setup.total}</span>
      </header>
      <div className="mx-4 h-1.5 overflow-hidden rounded-full bg-coast-line md:mx-5" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de la configuración">
        <div className="setup-progress h-full rounded-full bg-coast-red" style={{ width: `${percent}%` }} />
      </div>
      <ol className="mt-2 divide-y divide-uns-hairline">
        {setup.steps.map(({ key, done }) => {
          const { Icon, title, why } = STEPS[key] || {};
          if (!Icon) return null;
          return (
            <li key={key} className="px-4 py-3 md:px-5">
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-600 text-white' : 'bg-coast-cream text-coast-ink'}`}>
                  {done ? <Check size={15} strokeWidth={3} /> : <Icon size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-bold ${done ? 'text-uns-muted line-through decoration-1' : ''}`}>{title}</p>
                  {!done && <p className="truncate text-[12px] text-uns-muted">{why}</p>}
                </div>
                {!done && (key === 'address' ? (
                  <Link href="/cuenta/direcciones?nueva=1" className="inline-flex shrink-0 items-center gap-1 rounded-full border border-coast-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] hover:bg-coast-ink hover:text-white">
                    Agregar <ChevronRight size={13} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpen(open === key ? null : key)}
                    aria-expanded={open === key}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-coast-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] hover:bg-coast-ink hover:text-white"
                  >
                    {open === key ? 'Cerrar' : 'Completar'}
                  </button>
                ))}
              </div>
              {open === key && <InlineForm step={key} profile={profile} onSaved={onSaved} />}
            </li>
          );
        })}
      </ol>
      <footer className="border-t border-uns-hairline px-4 py-2.5 text-right md:px-5">
        <button type="button" onClick={dismiss} className="text-[11px] font-semibold text-uns-muted underline underline-offset-4 hover:text-coast-ink">
          No mostrar más
        </button>
      </footer>
    </section>
  );
}
