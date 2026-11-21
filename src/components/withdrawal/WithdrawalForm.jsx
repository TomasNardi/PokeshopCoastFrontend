'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { getServices } from '@/services/container';
import Field from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';

const EMPTY = { name: '', email: '', phone: '', order_code: '', reason: '', website: '' };

/**
 * Botón de arrepentimiento: sin login. Al enviar, el código de trámite aparece
 * en pantalla (y llega por mail). `?pedido=PSC-XXXXXX` lo deja precargado
 * (desde "Mi cuenta" o el mail de la compra).
 */
export default function WithdrawalForm() {
  const params = useSearchParams();
  const [form, setForm] = useState({ ...EMPTY, order_code: (params.get('pedido') || '').toUpperCase() });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const bind = (name) => ({
    value: form[name],
    error: errors[name],
    onChange: (e) => {
      setForm((f) => ({ ...f, [name]: e.target.value }));
      setErrors((er) => ({ ...er, [name]: undefined }));
    },
  });

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const res = await getServices().engagement.sendWithdrawal(form);
      setDone({ code: res?.code, email: form.email.trim() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (error.fieldErrors) setErrors(error.fieldErrors);
      toast.error(error.message || 'No pudimos enviar la solicitud. Probá de nuevo o escribinos.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const copy = () => navigator.clipboard?.writeText(done.code).then(() => toast.success('Código copiado')).catch(() => {});
    return (
      <div className="fade-up text-center" role="status">
        <CheckCircle2 size={44} className="mx-auto text-emerald-600" strokeWidth={1.8} />
        <h2 className="mt-4 font-heading text-[28px] font-bold leading-none">Recibimos tu solicitud</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] text-coast-gray">Este es tu código de trámite. Guardalo: es el comprobante de tu arrepentimiento.</p>
        <button type="button" onClick={copy} className="mx-auto mt-6 inline-flex items-center gap-3 border-2 border-dashed border-coast-ink px-6 py-4 font-heading text-[30px] font-bold tracking-[0.08em]">
          {done.code} <Copy size={18} className="text-coast-mist" aria-label="Copiar código" />
        </button>
        <p className="mx-auto mt-6 max-w-md text-[13px] leading-relaxed text-coast-gray">
          También te lo mandamos a <strong className="text-coast-ink">{done.email}</strong>. Te contactamos para coordinar la devolución
          (sin costo para vos) y el reintegro por el mismo medio de pago.
        </p>
        <Link href="/" className={`${buttonClass({ variant: 'outline' })} mt-8`}>Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre y apellido" autoComplete="name" {...bind('name')} />
        <Field label="Email de la compra" type="email" autoComplete="email" {...bind('email')} />
        <Field label="Código de pedido" placeholder="PSC-AB12CD" autoCapitalize="characters" {...bind('order_code')} />
        <Field label="Teléfono (opcional)" type="tel" autoComplete="tel" {...bind('phone')} />
      </div>
      <Field as="textarea" rows={4} label="Motivo (opcional)" placeholder="No es obligatorio contarnos por qué." {...bind('reason')} />
      {/* Honeypot: invisible para personas, los bots lo completan. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
      <button type="submit" disabled={sending} className={buttonClass({ size: 'lg', block: true })}>
        {sending ? 'Enviando…' : 'Me arrepiento de mi compra'}
      </button>
      <p className="text-[12px] leading-relaxed text-coast-mist">
        No necesitás tener cuenta ni iniciar sesión. Al enviar, te damos el código de trámite en el momento y te llega por mail.
      </p>
    </form>
  );
}
