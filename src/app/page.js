import { Suspense } from 'react';
import Link from 'next/link';
import { getServices } from '@/services/container';
import { HOME_HEROES } from '@/config/home';
import ParallaxHero from '@/components/home/ParallaxHero';
import ProductRail from '@/components/home/ProductRail';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton, ProductRailSkeleton } from '@/components/product/ProductSkeletons';
import Newsletter from '@/components/home/Newsletter';
import KeepLoading from '@/components/ui/KeepLoading';
import { PRESENTATION_MODE } from '@/config/presentation';
import JsonLd from '@/components/seo/JsonLd';
import { organizationJsonLd, websiteJsonLd } from '@/seo/structuredData';

export const metadata = { alternates: { canonical: '/' } };

// Modo presentación: "Comprar" baja a los productos en vez de ir a la tienda.
const mainHero = PRESENTATION_MODE
  ? { ...HOME_HEROES.main, cta: { ...HOME_HEROES.main.cta, href: '#nuevos-ingresos' } }
  : HOME_HEROES.main;
const secondaryHero = PRESENTATION_MODE ? { ...HOME_HEROES.secondary, cta: null } : HOME_HEROES.secondary;

const NEW_ARRIVALS = { id: 'nuevos-ingresos', title: 'Nuevos ingresos', href: '/tienda?ordering=-created_at' };
const SEALED_HREF = '/tienda?category=sellados';

// Stock fresco en cada visita (y en cada vuelta atrás, ver BackForwardRefresh).
export const dynamic = 'force-dynamic';

/** Marca de "no cargó" (distinta de "cargó vacío"). */
const FAILED = Symbol('failed');

/** Una sección que no carga nunca rompe la home: queda su esqueleto y se reintenta sola. */
async function loadSection(name, fn) {
  try {
    return await fn();
  } catch (error) {
    console.error(`[home] no se pudo cargar "${name}":`, error?.message || error);
    return FAILED;
  }
}

const railSkeleton = <ProductRailSkeleton id={NEW_ARRIVALS.id} title={NEW_ARRIVALS.title} />;

/** Sin productos: un espacio en blanco para que los dos banners no queden pegados. */
function ComingSoon() {
  return <div id={NEW_ARRIVALS.id} className="h-16 md:h-24" aria-hidden="true" />;
}

async function NewArrivals() {
  const products = await loadSection('nuevos ingresos', () => getServices().catalog.getNewArrivals());
  if (products === FAILED) return <KeepLoading>{railSkeleton}</KeepLoading>;
  if (!products?.length) return <ComingSoon />;
  return <ProductRail {...NEW_ARRIVALS} products={products} />;
}

/** Como la colección de unsobremas bajo el 2.º hero: título + 4 productos, y "Ver más". */
function SealedSection({ children }) {
  return (
    <section id="sellados" className="container-site pb-[50px] pt-12 md:pt-[50px]">
      <div className="mb-[15px] flex items-end justify-between gap-6">
        <h2 className="section-heading">Productos sellados</h2>
        {!PRESENTATION_MODE && (
          <Link href={SEALED_HREF} className="hidden text-[12px] font-bold uppercase tracking-[0.1em] text-uns-muted hover:text-black md:inline">
            Ver todo
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

const sealedSkeleton = (
  <SealedSection>
    <ProductGridSkeleton count={4} mobileSlider label="Cargando productos sellados" />
  </SealedSection>
);

async function SealedProducts() {
  const sealed = await loadSection('sellados', () =>
    getServices().catalog.getProductPage({ category: 'sellados', in_stock: 'true' })
  );
  if (sealed === FAILED) return <KeepLoading>{sealedSkeleton}</KeepLoading>;
  if (!sealed?.items.length) return null;
  return (
    <SealedSection>
      <ProductGrid products={sealed.items.slice(0, 4)} priorityCount={0} mobileSlider />
      {!PRESENTATION_MODE && (
        <div className="mt-8 flex justify-center">
          <Link href={SEALED_HREF} className="btn btn--dark">
            Ver más
          </Link>
        </div>
      )}
    </SealedSection>
  );
}

/**
 * Home con la misma secuencia que unsobremas: hero → novedades → hero → sellados → newsletter.
 * Los heroes salen al instante; cada sección de productos llega por su lado
 * (streaming) con un esqueleto del mismo tamaño mientras tanto.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <ParallaxHero {...mainHero} priority titleAs="h1" />
      <Suspense fallback={railSkeleton}>
        <NewArrivals />
      </Suspense>
      <ParallaxHero {...secondaryHero} height="two-thirds" titleSize="xl" />
      <Suspense fallback={sealedSkeleton}>
        <SealedProducts />
      </Suspense>
      <Newsletter />
    </>
  );
}
