'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getServices } from '@/services/container';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await getServices().engagement.subscribe(email);
      toast.success(res?.message || '¡Listo! Ya estás adentro.');
      setEmail('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-site border-t border-uns-hairline py-16 text-center md:py-20">
      <h2 className="section-heading">Enterate primero</h2>
      <p className="mx-auto mt-4 max-w-md text-[14px] font-bold uppercase tracking-[0.06em] text-uns-muted">
        Nuevos ingresos, preventas y descuentos antes que nadie.
      </p>
      <form onSubmit={submit} className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="TU EMAIL"
          aria-label="Tu email"
          className="input flex-1 font-bold uppercase"
        />
        <button type="submit" disabled={loading} className="btn btn--dark disabled:opacity-50">
          {loading ? 'Enviando…' : 'Suscribirme'}
        </button>
      </form>
    </section>
  );
}
