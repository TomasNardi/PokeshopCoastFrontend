'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getServices } from '@/services/container';
import { AUTH_ROUTES } from '@/services/auth/authService';
import Field from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';

/** Paso 1 de la recuperación: pedir el link por email. */
export default function RecoverPasswordForm({ service = getServices().passwordRecovery }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { message } = await service.requestReset(email);
      setSent(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className="space-y-5">
        <p className="text-[15px] leading-relaxed text-coast-gray">{sent}</p>
        <Link href={AUTH_ROUTES.login} className={buttonClass({ variant: 'outline' })}>Volver a ingresar</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Email de tu cuenta" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
      <button type="submit" disabled={loading} className={buttonClass({ size: 'lg', block: true })}>
        {loading ? 'Enviando…' : 'Mandarme el link'}
      </button>
      <Link href={AUTH_ROUTES.login} className="block text-center text-[12px] font-semibold text-coast-gray hover:text-coast-ink">
        Me acordé, quiero ingresar
      </Link>
    </form>
  );
}
