'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MailCheck, PackageCheck } from 'lucide-react';
import { getServices } from '@/services/container';
import { AUTH_ROUTES } from '@/services/auth/authService';
import { isValidPassword } from '@/domain/passwordRules';
import Field from '@/components/ui/Field';
import { buttonClass } from '@/components/ui/Button';
import GoogleButton from '@/components/auth/GoogleButton';
import PasswordChecklist from '@/components/auth/PasswordChecklist';

const ORDERS_PATH = '/cuenta/pedidos';
const LOGIN_HREF = `${AUTH_ROUTES.login}?next=${ORDERS_PATH}`;

/**
 * Registro en un paso al terminar la compra como invitado. El email ya lo
 * tenemos (el del pedido): solo falta una contraseña, o Google.
 *
 * Por qué el pedido queda vinculado, sin depender de nada más:
 *   - la cuenta se crea con el MISMO email del pedido → al confirmarlo (email
 *     verificado) el backend le pasa sus compras desde cualquier dispositivo;
 *   - y este navegador guarda la constancia firmada del pedido → con Google
 *     (aunque sea otro mail) se vincula al volver.
 */
export default function QuickSignup({ email, orderCode }) {
  const { auth } = getServices();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Login de desarrollo (sin registro): solo el atajo a ingresar.
  if (auth.acceptsUsername) {
    return (
      <Shell title="Seguí tu pedido desde tu cuenta" text="Al ingresar, este pedido se suma solo a Mi cuenta.">
        <Link href={LOGIN_HREF} className={buttonClass({ size: 'sm', className: 'mt-4' })}>Ingresar</Link>
      </Shell>
    );
  }

  if (sent) {
    return (
      <Shell icon={MailCheck} title="Confirmá tu mail y listo" live>
        Te mandamos un link a <strong className="text-coast-ink">{email}</strong>. Apenas lo abras
        {orderCode ? <>, el pedido <strong className="text-coast-ink">{orderCode}</strong> ya va a estar</> : ', tu pedido ya va a estar'} en
        Mi cuenta, desde cualquier dispositivo.
        <button
          type="button"
          className="mt-3 block text-[13px] font-semibold text-coast-red hover:underline"
          onClick={() => auth.resendConfirmation(email).then(() => toast.success('Email reenviado')).catch((e) => toast.error(e.message))}
        >
          Reenviar email
        </button>
      </Shell>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await auth.signUp({ email, password });
      setSent(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell
      title="Guardá este pedido en tu cuenta"
      text={<>Solo falta una contraseña: la cuenta usa el mail de tu compra y el pedido queda adentro, con su estado y el seguimiento del envío. Es opcional.</>}
    >
      <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
        <p className="text-[12px] text-uns-muted">
          Cuenta: <strong className="text-coast-ink">{email}</strong>
        </p>
        <Field
          label="Elegí una contraseña"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* username oculto: los gestores de contraseñas guardan el par correcto. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        {password && <PasswordChecklist password={password} />}
        <button type="submit" disabled={loading || !isValidPassword(password)} className={buttonClass({ block: true })}>
          {loading ? 'Creando tu cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-coast-mist">
        <span className="h-px flex-1 bg-coast-line" /> o <span className="h-px flex-1 bg-coast-line" />
      </div>
      <GoogleButton auth={auth} returnTo={ORDERS_PATH} />
      <p className="mt-4 text-center text-[12px] text-uns-muted">
        ¿Ya tenés cuenta?{' '}
        <Link href={LOGIN_HREF} className="font-semibold text-coast-ink underline underline-offset-4 hover:text-coast-red">Ingresá</Link>
      </p>
    </Shell>
  );
}

function Shell({ icon: Icon = PackageCheck, title, text, live = false, children }) {
  return (
    <div
      className="result-rise mt-8 w-full max-w-md border border-coast-line bg-uns-stage p-5 text-left [animation-delay:.25s]"
      role={live ? 'status' : undefined}
    >
      <p className="flex items-center gap-2 text-[14px] font-bold"><Icon size={18} aria-hidden="true" /> {title}</p>
      {text ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-uns-muted">{text}</p>
      ) : (
        <div className="mt-1.5 text-[13px] leading-relaxed text-uns-muted">{children}</div>
      )}
      {text && children}
    </div>
  );
}
