import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="container-site flex flex-col items-center py-28 text-center">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-7xl">Esta carta no salió en el sobre.</h1>
      <p className="mt-5 max-w-md text-coast-gray">La página que buscás no existe o se movió.</p>
      <Button href="/tienda" className="mt-10" size="lg">
        Ir a la tienda
      </Button>
    </section>
  );
}
