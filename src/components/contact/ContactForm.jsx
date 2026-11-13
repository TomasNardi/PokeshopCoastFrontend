'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getServices } from '@/services/container';
import { CONTACT_SUBJECTS } from '@/services/engagement/engagementService';
import Field from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';

const EMPTY = { name: '', email: '', phone: '', subject: 'compra', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

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
      const res = await getServices().engagement.sendContact(form);
      toast.success(res?.message || 'Mensaje enviado. Te respondemos pronto.');
      setForm(EMPTY);
    } catch (error) {
      if (error.fieldErrors) setErrors(error.fieldErrors);
      toast.error(error.message || 'No pudimos enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" autoComplete="name" {...bind('name')} />
        <Field label="Email" type="email" autoComplete="email" {...bind('email')} />
        <Field label="WhatsApp (opcional)" type="tel" autoComplete="tel" {...bind('phone')} />
        <Field as="select" label="Motivo" {...bind('subject')}>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Field>
      </div>
      <Field as="textarea" rows={6} label="Mensaje" placeholder="¿En qué te podemos ayudar?" {...bind('message')} />
      <button type="submit" disabled={sending} className={buttonClass({ size: 'lg' })}>
        {sending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
