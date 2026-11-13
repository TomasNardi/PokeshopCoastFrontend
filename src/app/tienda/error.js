'use client';
import Button from '@/components/ui/Button';

export default function TiendaError({ reset }) {
  return (
    <section className="container-site py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold">No pudimos cargar la tienda.</h1>
      <p className="mt-3 text-coast-gray">Puede ser un problema de conexión. Probá de nuevo en unos segundos.</p>
      <Button onClick={() => reset()} className="mt-8">
        Reintentar
      </Button>
    </section>
  );
}
