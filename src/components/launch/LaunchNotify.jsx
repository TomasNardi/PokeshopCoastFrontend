'use client';
import { useState } from 'react';
import { getServices } from '@/services/container';

/**
 * "Avisame cuando abra": suscribe al newsletter con source "lanzamiento".
 * Sin toasts (la página de lanzamiento vive fuera de los Providers): el
 * resultado se muestra en la misma línea.
 */
export default function LaunchNotify({ day }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });
  const sending = state.status === 'sending';

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setState({ status: 'sending', message: '' });
    try {
      await getServices().engagement.subscribe(email, { source: 'lanzamiento' });
      setState({ status: 'done', message: `¡Listo! Te escribimos el ${day} apenas abramos.` });
      setEmail('');
    } catch (error) {
      setState({ status: 'error', message: error?.message || 'No pudimos anotarte. Probá de nuevo.' });
    }
  };

  if (state.status === 'done') {
    return (
      <p className="launch-notify__done" role="status">
        <span className="launch-notify__check" aria-hidden="true">✓</span>
        {state.message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="launch-notify" noValidate>
      <label htmlFor="launch-email" className="launch-notify__label">Avisame cuando abra</label>
      <div className="launch-notify__row">
        <input
          id="launch-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Tu email"
          disabled={sending}
          aria-invalid={state.status === 'error' || undefined}
          aria-describedby={state.status === 'error' ? 'launch-email-error' : undefined}
          className="launch-notify__input"
        />
        <button type="submit" disabled={sending} className="launch-notify__button">
          {sending ? 'Anotando…' : 'Avisame'}
        </button>
      </div>
      {state.status === 'error' && (
        <p id="launch-email-error" role="alert" className="launch-notify__error">{state.message}</p>
      )}
    </form>
  );
}
