'use client';
import Button from '@/components/ui/Button';

export default function ErrorPage({ error, reset }) {
  return (
    <section className="container-site flex flex-col items-center py-28 text-center">
      <p className="eyebrow mb-4">Ups</p>
      <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">Algo se nos mojó.</h1>
      <p className="mt-5 max-w-md text-coast-gray">{error?.message || 'Tuvimos un problema cargando esta página.'}</p>
      <div className="mt-10 flex gap-3">
        <Button onClick={() => reset()} size="lg">
          Reintentar
        </Button>
        <Button href="/" variant="outline" size="lg">
          Ir al inicio
        </Button>
      </div>
    </section>
  );
}
