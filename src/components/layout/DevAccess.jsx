'use client';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/** "Acceso desarrollo" de la página de mantenimiento: entra y ve la tienda. */
export default function DevAccess() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    userRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && !submitting && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, submitting]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/acceso-desarrollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
      });
      if (!response.ok) {
        setError('Usuario o contraseña incorrectos.');
        setSubmitting(false);
        return;
      }
      window.location.reload();
    } catch {
      setError('Error de conexión. Probá de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className="maintenance__access" onClick={() => setOpen(true)}>
        Acceso desarrollo
      </button>

      {open && (
        <div className="dev-access" onClick={() => !submitting && setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dev-access-title"
            className="dev-access__panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="dev-access__close" onClick={() => setOpen(false)} disabled={submitting} aria-label="Cerrar">
              <X size={18} strokeWidth={2} />
            </button>
            <h2 id="dev-access-title" className="dev-access__title">Acceso desarrollo</h2>
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
              <input ref={userRef} name="username" required autoComplete="username" placeholder="Usuario" disabled={submitting} className="dev-access__input" />
              <input name="password" type="password" required autoComplete="current-password" placeholder="Contraseña" disabled={submitting} className="dev-access__input" />
              {error && <p role="alert" className="text-[13px] text-coast-red">{error}</p>}
              <button type="submit" disabled={submitting} className="btn btn--dark mt-2 w-full">
                {submitting ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
