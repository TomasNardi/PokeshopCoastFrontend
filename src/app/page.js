import { getServices } from '@/services/container';
import { HOME_HEROES } from '@/config/home';
import ParallaxHero from '@/components/home/ParallaxHero';
import ProductRail from '@/components/home/ProductRail';
import ProductGrid from '@/components/product/ProductGrid';
import Newsletter from '@/components/home/Newsletter';
import SocialConnect from '@/components/home/SocialConnect';
import { PRESENTATION_MODE } from '@/config/env';

// Modo presentación: "Comprar" baja a los productos en vez de ir a la tienda.
const mainHero = PRESENTATION_MODE
  ? { ...HOME_HEROES.main, cta: { ...HOME_HEROES.main.cta, href: '#nuevos-ingresos' } }
  : HOME_HEROES.main;
const secondaryHero = PRESENTATION_MODE ? { ...HOME_HEROES.secondary, cta: null } : HOME_HEROES.secondary;

// Stock fresco en cada visita (y en cada vuelta atrás, ver BackForwardRefresh).
export const dynamic = 'force-dynamic';

/** Home con la misma secuencia que unsobremas: hero → novedades → hero → colección → newsletter. */
export default async function HomePage() {
  const { catalog } = getServices();
  const [newArrivals, page] = await Promise.all([catalog.getNewArrivals(), catalog.getProductPage({ in_stock: 'true' })]);

  return (
    <>
      <ParallaxHero {...mainHero} priority titleAs="h1" />
      <ProductRail id="nuevos-ingresos" title="Nuevos ingresos" href="/tienda?ordering=-created_at" products={newArrivals} />
      <ParallaxHero {...secondaryHero} height="two-thirds" titleSize="xl" />
      <section className="container-site pb-[50px] pt-12 md:pt-[50px]">
        <h2 className="section-heading mb-[15px]">Catálogo</h2>
        <ProductGrid products={page.items.slice(0, 8)} priorityCount={0} mobileSlider />
      </section>
      <SocialConnect />
      <Newsletter />
    </>
  );
}
