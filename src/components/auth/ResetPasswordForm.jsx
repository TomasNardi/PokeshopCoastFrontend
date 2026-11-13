'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getServices } from '@/services/container';
import { AUTH_ROUTES } from '@/services/auth/authService';
import { useSession } from './SessionProvider';
import Field from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import PasswordChecklist from './PasswordChecklist';

/**
 * Paso 2: el usuario llega desde el link del mail. El proveedor ya abrió una
 * sesión temporal (evento PASSWORD_RECOVERY); sin sesión, el link venció.
 */
export default function ResetPasswordForm({ service = getServices().passwordRecovery }) {
  const router = useRouter();
  const { status, finishRecovery } = useSession();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'loading') return <p className="text-coast-gray">Validando el link…</p>;
  if (status !== 'authenticated') {
    return (
      <div className="space-y-5">
        <p className="text-coast-gray">El link venció o ya se usó. Pedí uno nuevo.</p>
        <Link href={AUTH_ROUTES.recover} className={buttonClass()}>Pedir otro link</Link>
      </div>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { message } = await service.resetPassword(password, confirmation);
      finishRecovery();
      toast.success(message);
      router.replace(AUTH_ROUTES.account);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Nueva contraseña" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <PasswordChecklist password={password} />
      <Field label="Repetila" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} error={error} />
      <button type="submit" disabled={loading} className={buttonClass({ size: 'lg', block: true })}>
        {loading ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  );
}
