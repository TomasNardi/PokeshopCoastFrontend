'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { getServices } from '@/services/container';
import { AUTH_ROUTES } from '@/services/auth/authService';
import { useSession } from './SessionProvider';
import Field from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import GoogleButton from './GoogleButton';
import PasswordChecklist from './PasswordChecklist';
import { LoginFormSkeleton } from './AuthSkeletons';

const MODES = { login: 'Ingresar', signup: 'Crear cuenta' };

export default function LoginForm() {
  const { auth } = getServices();
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, status } = useSession();
  const returnTo = auth.safePath(params.get('next') || AUTH_ROUTES.account);

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.replace(returnTo);
  }, [isAuthenticated, returnTo, router]);

  // Sesión sin confirmar, o ya logueado y a punto de redirigir: sin parpadeo del formulario.
  if (status === 'loading' || isAuthenticated) return <LoginFormSkeleton />;

  if (status === 'disabled') {
    return <p className="text-coast-gray">Las cuentas no están disponibles por ahora. Podés comprar igual como invitado.</p>;
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await auth.signInWithPassword({ email, password });
      } else {
        await auth.signUp({ email, password });
        setSentTo(email);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-display text-2xl font-extrabold">Revisá tu email</h2>
        <p className="text-[14px] text-coast-gray">
          Te mandamos un link a <strong className="text-coast-ink">{sentTo}</strong> para confirmar tu cuenta.
        </p>
        <button type="button" className="text-[13px] font-semibold text-coast-red hover:underline" onClick={() => auth.resendConfirmation(sentTo).then(() => toast.success('Email reenviado')).catch((e) => toast.error(e.message))}>
          Reenviar email
        </button>
      </div>
    );
  }

  // Login de desarrollo (backend local): usuario de prueba, sin Google ni registro.
  if (auth.acceptsUsername) {
    return (
      <form onSubmit={submit} className="space-y-4">
        <p className="rounded-xl bg-coast-cream px-4 py-3 text-[13px] text-coast-ink">
          Modo desarrollo · usuario <strong>tomi</strong> / contraseña <strong>tomi</strong>
        </p>
        <Field label="Usuario" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className={buttonClass({ size: 'lg', block: true })}>
          {loading ? 'Un momento…' : 'Ingresar'}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <GoogleButton auth={auth} returnTo={returnTo} />

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-coast-mist">
        <span className="h-px flex-1 bg-coast-line" /> o con tu email <span className="h-px flex-1 bg-coast-line" />
      </div>

      <div role="tablist" className="grid grid-cols-2 rounded-full bg-coast-cream-deep p-1">
        {Object.entries(MODES).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={`rounded-full py-2 text-[12px] font-bold uppercase tracking-[0.12em] ${mode === key ? 'bg-white shadow-sm' : 'text-coast-gray'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Contraseña"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === 'signup' && <PasswordChecklist password={password} />}
        {mode === 'login' && (
          <Link href={AUTH_ROUTES.recover} className="block text-right text-[12px] font-semibold text-coast-gray hover:text-coast-red">
            ¿Olvidaste tu contraseña?
          </Link>
        )}
        <button type="submit" disabled={loading} className={buttonClass({ size: 'lg', block: true })}>
          {loading ? 'Un momento…' : MODES[mode]}
        </button>
      </form>
    </div>
  );
}
