'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PRESENTATION_MODE } from '@/config/presentation';

/**
 * Fila deslizable de productos (grid-slider del tema): 4 por vista en desktop,
 * ~2 en mobile, flechas para avanzar de a una "página".
 */
export default function ProductRail({ id, title, href, products = [], limit = 12 }) {
  const trackRef = useRef(null);
  if (!products.length) return null;

  const scroll = (direction) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <section id={id} className="scroll-mt-[var(--header-height)] pb-8 pt-12 md:pt-[50px]">
      <div className="container-site mb-[15px] flex items-end justify-between gap-6">
        <h2 className="section-heading">{title}</h2>
        <div className="flex items-center gap-1">
          {href && !PRESENTATION_MODE && (
            <Link href={href} className="mr-3 hidden text-[12px] font-bold uppercase tracking-[0.1em] text-uns-muted hover:text-black md:inline">
              Ver todo
            </Link>
          )}
          {/* Flechas solo con mouse: en táctil el carrusel se desliza con el dedo. */}
          <div className="rail-arrows items-center gap-1">
            <button type="button" onClick={() => scroll(-1)} aria-label="Anterior" className="flex h-10 w-10 items-center justify-center hover:bg-uns-stage">
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="Siguiente" className="flex h-10 w-10 items-center justify-center hover:bg-uns-stage">
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
      <div ref={trackRef} className="rail-track hide-scrollbar flex snap-x snap-mandatory gap-[5px] overflow-x-auto scroll-px-[var(--outer)] px-[var(--outer)] md:gap-[var(--gap)]">
        {products.slice(0, limit).map((product, index) => (
          // Mobile = unsobremas (.grid--mobile-slider): card de (ancho − margen izq. − 120px), 5px de separación (~1,5 por pantalla).
          <div key={product.id} className="w-[calc(100%+var(--outer)-120px)] shrink-0 snap-start md:w-[calc((100%-2*var(--gap))/3)] xl:w-[calc((100%-3*var(--gap))/4)]">
            <ProductCard product={product} priority={index < 4} />
          </div>
        ))}
      </div>
    </section>
  );
}
