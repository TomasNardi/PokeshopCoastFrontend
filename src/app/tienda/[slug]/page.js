import { Suspense, cache } from 'react';
import { notFound } from 'next/navigation';
import { Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { getServices } from '@/services/container';
import { defaultDescription, productView } from '@/domain/product';
import ProductGallery from '@/components/product/ProductGallery';
import ProductPurchase from '@/components/product/ProductPurchase';
import ProductRail from '@/components/home/ProductRail';
import { ProductRailSkeleton } from '@/components/product/ProductSkeletons';
import DamageNote from '@/components/product/DamageNote';
import PaymentPrices from '@/components/product/PaymentPrices';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import CompleteYourOrder from '@/components/product/CompleteYourOrder';
import StickyBuyBar from '@/components/product/StickyBuyBar';
import { Description, DetailRows, ShippingInfo } from '@/components/product/ProductInfo';
import InfoSection from '@/components/product/InfoSection';
import { CertBadge, ConditionBadge, DiscountBadge, StockStatus } from '@/components/product/ProductBadges';

export const dynamic = 'force-dynamic';

// generateMetadata y la página piden el mismo producto: una sola llamada a la API.
const loadProduct = cache((slug) => getServices().catalog.getProduct(slug));
// Recargo de Mercado Pago del backoffice. Se pide en paralelo con el producto
// (no suma espera) y si falla la página sale igual, con el precio solo.
const loadPaymentConfig = () => getServices().orders.getPaymentConfig().catch(() => null);
// Las dos vidrieras (lo elegido en el admin primero). Nunca rompe la ficha.
const loadSuggestions = cache((product) => getServices().catalog.getSuggestions(product));

const RELATED_TITLE = 'Te puede interesar';

async function RelatedProducts({ product }) {
  const { related } = await loadSuggestions(product);
  return <ProductRail title={RELATED_TITLE} products={related} limit={8} />;
}

async function Complements({ product }) {
  const { complete } = await loadSuggestions(product);
  return <CompleteYourOrder products={complete} />;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: 'Producto no encontrado' };
  const seo = product.seo || {};
  return {
    // El título del backend ya trae la marca: va sin la plantilla "| PokeShop Coast".
    title: seo.title ? { absolute: seo.title } : product.name,
    description: seo.description || `${product.name} en PokeShop Coast. Envíos a todo el país.`,
    alternates: { canonical: `/tienda/${slug}` },
    openGraph: { images: product.image_url ? [product.image_url] : [] },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [product, paymentConfig] = await Promise.all([loadProduct(slug), loadPaymentConfig()]);
  if (!product) notFound();

  const view = productView(product);
  const isCard = view.kind === 'single' || view.kind === 'slab';
  const details = [
    ['Set', view.catalog?.set_name],
    ['Número', view.catalog?.number],
    ['Rareza', view.catalog?.rarity],
    ['Acabado', view.finish],
    ['Idioma', view.language?.label],
    ['Certificación', view.certLabel],
    ['Estado', view.condition?.label],
    ['Categoría', view.category],
  ];

  return (
    <>
      {product.seo?.json_ld && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product.seo.json_ld).replace(/</g, '\\u003c') }} />
      )}

      <div className="container-site pt-5 md:pt-8">
        <ProductBreadcrumb category={view.category} categorySlug={view.categorySlug} name={view.name} />
      </div>

      <section className="container-site grid gap-8 pb-8 pt-5 md:pt-6 lg:grid-cols-2 lg:gap-16">
        <div className="group min-w-0">
          <ProductGallery images={view.images} alt={view.name} effect={view.isCard ? 'tilt' : 'zoom'}>
            <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-2">
              <DiscountBadge percent={view.discountPercent} />
            </div>
          </ProductGallery>
        </div>

        <div className="fade-up min-w-0 lg:pt-2" style={{ '--delay': '0.1s' }}>
          {view.subtitle && <p className="eyebrow mb-2">{view.subtitle}</p>}
          <h1 className="font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-5xl">{view.title}</h1>
          {view.traits.length > 0 && <p className="mt-3 text-[13px] font-semibold text-coast-gray">{view.traits.join(' · ')}</p>}

          {view.language && view.languageSentence && (
            <p className="mt-4 flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.06em]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.language.flag} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover shadow-sm ring-1 ring-black/10" style={{ objectPosition: view.language.focus || 'center' }} />
              {view.languageSentence}
            </p>
          )}

          <PaymentPrices
            price={view.price}
            compareAtPrice={view.compareAtPrice}
            hasDiscount={view.hasDiscount}
            inStock={view.stockStatus !== 'out'}
            config={paymentConfig}
          />

          <div className="mt-5 flex flex-col items-start gap-3">
            {view.certLabel && <CertBadge label={view.certLabel} large />}
            <ConditionBadge condition={view.condition} detailed />
            <StockStatus status={view.stockStatus} quantity={view.maxQuantity} />
            {view.isOutlet && <DamageNote note={view.damageNote} />}
          </div>

          <div id="buy-anchor" className="mt-6">
            <ProductPurchase product={product} />
          </div>

          <ul className="mt-5 space-y-2.5 text-[13px] text-uns-muted">
            <li className="flex items-start gap-3"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-coast-red" /> {view.trustLine}</li>
            <li className="flex items-start gap-3"><Truck size={16} className="mt-0.5 shrink-0 text-coast-red" /> Envíos a todo el país o retiro en persona.</li>
            <li className="flex items-start gap-3"><CreditCard size={16} className="mt-0.5 shrink-0 text-coast-red" /> Mercado Pago en cuotas o transferencia.</li>
          </ul>

          <div className="mt-6">
            <Suspense fallback={null}>
              <Complements product={product} />
            </Suspense>
          </div>

          <div className="mt-6 border-b border-coast-line">
            <InfoSection title="Descripción">
              <Description
                text={view.description}
                fallback={defaultDescription(view.kind, { name: view.name, setName: view.catalog?.set_name })}
              />
            </InfoSection>
            <InfoSection title={isCard ? 'Detalles de la carta' : 'Detalles'}>
              <DetailRows rows={details} />
            </InfoSection>
            <InfoSection title="Envíos y pagos">
              <ShippingInfo />
            </InfoSection>
          </div>
        </div>
      </section>

      <Suspense fallback={<ProductRailSkeleton title={RELATED_TITLE} />}>
        <RelatedProducts product={product} />
      </Suspense>

      <StickyBuyBar product={product} price={view.price} />
    </>
  );
}
