import { Suspense, cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { getServices } from '@/services/container';
import { productView } from '@/domain/product';
import ProductGallery from '@/components/product/ProductGallery';
import ProductPurchase from '@/components/product/ProductPurchase';
import ProductRail from '@/components/home/ProductRail';
import { ProductRailSkeleton } from '@/components/product/ProductSkeletons';
import DamageNote from '@/components/product/DamageNote';
import PaymentPrices from '@/components/product/PaymentPrices';
import { CertBadge, ConditionBadge, DiscountBadge, LanguageFlag, StockStatus } from '@/components/product/ProductBadges';

export const dynamic = 'force-dynamic';

// generateMetadata y la página piden el mismo producto: una sola llamada a la API.
const loadProduct = cache((slug) => getServices().catalog.getProduct(slug));
// Recargo de Mercado Pago del backoffice. Se pide en paralelo con el producto
// (no suma espera) y si falla la página sale igual, con el precio solo.
const loadPaymentConfig = () => getServices().orders.getPaymentConfig().catch(() => null);

const RELATED_TITLE = 'También te puede gustar';

async function RelatedProducts({ product }) {
  const related = await getServices().catalog.getRelated(product);
  return <ProductRail title={RELATED_TITLE} products={related} limit={4} />;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: 'Producto no encontrado' };
  return {
    title: product.name,
    description: `${product.name} en PokeShop Coast. Envíos a todo el país.`,
    alternates: { canonical: `/tienda/${slug}` },
    openGraph: { images: product.image_url ? [product.image_url] : [] },
  };
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-coast-line py-3 text-[13px]">
      <dt className="text-coast-gray">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [product, paymentConfig] = await Promise.all([loadProduct(slug), loadPaymentConfig()]);
  if (!product) notFound();

  const view = productView(product);

  return (
    <>
      <div className="container-site pt-8">
        <Link href="/tienda" className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-coast-gray hover:text-coast-ink">
          <ChevronLeft size={14} /> Tienda
        </Link>
      </div>

      <section className="container-site grid gap-10 py-8 lg:grid-cols-2 lg:gap-16">
        <div className="group">
          <ProductGallery images={view.images} alt={view.name} effect={view.isCard ? 'tilt' : 'zoom'}>
            <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-2">
              <DiscountBadge percent={view.discountPercent} />
              <LanguageFlag language={view.language} />
            </div>
          </ProductGallery>
        </div>

        <div className="fade-up min-w-0 lg:pt-6" style={{ '--delay': '0.1s' }}>
          <p className="eyebrow mb-3">{view.subtitle}</p>
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{view.title}</h1>
          {view.traits.length > 0 && <p className="mt-3 text-[13px] font-semibold text-coast-gray">{view.traits.join(' · ')}</p>}

          <PaymentPrices
            price={view.price}
            compareAtPrice={view.compareAtPrice}
            hasDiscount={view.hasDiscount}
            inStock={view.stockStatus !== 'out'}
            config={paymentConfig}
          />

          <div className="mt-6 flex flex-col items-start gap-4">
            {view.certLabel && <CertBadge label={view.certLabel} large />}
            <ConditionBadge condition={view.condition} detailed />
            <StockStatus status={view.stockStatus} quantity={view.maxQuantity} />
            {view.isOutlet && <DamageNote note={view.damageNote} />}
          </div>

          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>

          <ul className="mt-8 space-y-3 bg-uns-stage p-5 text-[13px] text-uns-muted">
            <li className="flex items-start gap-3"><Truck size={16} className="mt-0.5 shrink-0 text-coast-red" /><span>Envíos a todo el país o retiro en persona. <Link href="/envios" className="whitespace-nowrap font-semibold text-black underline underline-offset-4">Ver opciones</Link></span></li>
            <li className="flex items-start gap-3"><CreditCard size={16} className="mt-0.5 shrink-0 text-coast-red" /> Pagá con Mercado Pago o transferencia.</li>
            <li className="flex items-start gap-3"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-coast-red" /> La foto es de la carta que recibís.</li>
          </ul>

          <dl className="mt-8">
            <DetailRow label="Set" value={view.catalog?.set_name} />
            <DetailRow label="Número" value={view.catalog?.number} />
            <DetailRow label="Rareza" value={view.catalog?.rarity} />
            <DetailRow label="Acabado" value={view.finish} />
            <DetailRow label="Idioma" value={view.language?.label} />
            <DetailRow label="Certificación" value={view.certLabel} />
            <DetailRow label="Estado" value={view.condition?.label} />
          </dl>
          {view.description && <p className="mt-6 text-[14px] leading-relaxed text-coast-gray">{view.description}</p>}
        </div>
      </section>

      <Suspense fallback={<ProductRailSkeleton title={RELATED_TITLE} />}>
        <RelatedProducts product={product} />
      </Suspense>
    </>
  );
}
