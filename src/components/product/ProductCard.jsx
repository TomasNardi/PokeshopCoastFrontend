import Link from 'next/link';
import { productView } from '@/domain/product';
import { formatPrice } from '@/domain/money';
import ProductStage from './ProductStage';
import AddToCartButton from './AddToCartButton';
import { CertBadge, ConditionBadge, LanguageFlag, OutletBadge, SaleBadge, SoldOutBadge } from './ProductBadges';
import { PRESENTATION_MODE } from '@/config/presentation';

/** En modo presentación la card se ve y anima igual, pero no es un link. */
function CardLink({ href, children, ...rest }) {
  if (PRESENTATION_MODE) return <div {...rest}>{children}</div>;
  return <Link href={href} {...rest}>{children}</Link>;
}

/**
 * Card de producto (estilo product-item de unsobremas): escenario gris 5:6,
 * título en mayúsculas, categoría gris y precio; rebajado en rojo con el
 * precio anterior tachado. Server Component: solo imagen y botón son de cliente.
 */
export default function ProductCard({ product, priority = false }) {
  const view = productView(product);
  const subtitle = [view.subtitle, ...view.traits].filter(Boolean).join(' · ');

  return (
    <article className="product-item group">
      <div className="product-item__media">
        <CardLink href={view.href} className="block" aria-label={view.name}>
          <ProductStage src={view.imageUrl} alt={view.name} priority={priority}>
            <div className="product-item__badges product-item__badges--left">
              <OutletBadge show={view.isOutlet} />
              <SaleBadge show={view.hasDiscount && view.isAvailable && !view.isOutlet} />
              <SoldOutBadge show={!view.isAvailable} />
            </div>
            <div className="product-item__badges product-item__badges--right">
              {view.certLabel ? <CertBadge label={view.certLabel} /> : <ConditionBadge condition={view.condition} />}
            </div>
            {view.language && (
              <span className="product-item__lang">
                <LanguageFlag language={view.language} />
              </span>
            )}
          </ProductStage>
        </CardLink>

        {/* Quick add (fuera del <Link>: un botón dentro de un <a> es HTML inválido). */}
        {view.isAvailable && !PRESENTATION_MODE && (
          <div className="product-item__quick">
            <AddToCartButton product={product} variant="icon" />
          </div>
        )}
      </div>

      <CardLink href={view.href} className="product-item__info">
        <h3 className="product-item__title" title={view.name}>{view.title}</h3>
        <p className="product-item__category" title={subtitle}>{subtitle || ' '}</p>
        <p className={`product-item__price ${view.hasDiscount ? 'is-sale' : ''}`}>
          <span className="new-price">{formatPrice(view.price)}</span>
          {view.compareAtPrice && <span className="old-price">{formatPrice(view.compareAtPrice)}</span>}
        </p>
      </CardLink>
    </article>
  );
}
