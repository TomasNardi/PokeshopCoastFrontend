import ProductCard from './ProductCard';

/**
 * @param {boolean} [mobileSlider] en mobile (<750px) pasa de grilla de 2 columnas
 *   a carrusel deslizable con cards grandes, como las secciones de la home de unsobremas.
 */
export default function ProductGrid({ products, priorityCount = 4, mobileSlider = false, emptyMessage = 'No encontramos productos con esos filtros.' }) {
  if (!products?.length) {
    return (
      <div className="border border-dashed border-uns-border px-6 py-16 text-center text-[14px] font-bold uppercase tracking-[0.06em] text-uns-muted">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className={`product-grid ${mobileSlider ? 'product-grid--mobile-slider hide-scrollbar' : ''}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}
