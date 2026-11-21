'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SPEED = 0.35;
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Hero a todo el ancho con parallax (como section-hero de Broadcast):
 * imagen de fondo que se mueve más lento que el scroll, contenido abajo a la
 * izquierda en desktop y centrado en mobile, entrada escalonada.
 *
 * @param {object} props
 * @param {{ desktop: string, mobile?: string, alt?: string }} props.image
 * @param {'three-quarters'|'two-thirds'} [props.height]
 * @param {'cover'|'split'|'stage'} [props.layout]
 *   cover: la imagen ocupa todo el hero.
 *   stage: composición ya armada sobre negro; en desktop se ve entera
 *          (contain, anclada con focal) y en mobile se encuadra con focalMobile.
 *   split: fondo negro fijo con el texto a la izquierda y la imagen anclada a
 *          la derecha, fundida al negro con un degradado. Sirve para cambiar
 *          la imagen sin tocar el diseño: cualquier arte queda igual.
 */
export default function ParallaxHero({
  image,
  subtitle,
  title,
  cta,
  logo = '',
  height = 'three-quarters',
  titleSize = 'large',
  layout = 'cover',
  shade = 'default',
  priority = false,
  titleAs: Title = 'h2',
}) {
  const paneRef = useRef(null);
  const frameRef = useRef(null);

  // Layout effect: si la página se abre ya scrolleada (volver atrás), la
  // posición se aplica antes del primer pintado y tampoco hay salto.
  useIsomorphicLayoutEffect(() => {
    const pane = paneRef.current;
    const frame = frameRef.current;
    if (!pane || !frame || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    // Posición de reposo: dónde está el hero con la página arriba de todo. El
    // desplazamiento se mide desde ahí y no desde el borde de la pantalla: si
    // no, un hero que arranca debajo de la barra de anuncio y del header
    // (top ≈ 36px) saltaba 13px apenas hidrataba, sin haber scrolleado.
    // Los que están más abajo de la primera pantalla siguen centrando el
    // efecto en el borde superior (ahí el salto no se ve: están fuera de vista).
    const docTop = frame.getBoundingClientRect().top + window.scrollY;
    const rest = docTop < window.innerHeight ? docTop : 0;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      pane.style.transform = `translate3d(0, ${(-(rect.top - rest) * SPEED).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      ref={frameRef}
      className={`hero hero--${height} hero--${layout} ${shade === 'strong' ? 'hero--shade-strong' : ''}`}
      style={{ '--focal': image.focal || 'center', '--focal-mobile': image.focalMobile || image.focal || 'center' }}
    >
      <div ref={paneRef} className="hero__pane">
        <picture>
          {image.mobile && <source media="(max-width: 749px)" srcSet={image.mobile} />}
          <img
            src={image.desktop}
            alt={image.alt || ''}
            className="hero__img"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </picture>
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" width={190} height={192} className="hero__logo fade-up" style={{ '--delay': '0s' }} />
        )}
        {subtitle && <p className="hero__subtitle fade-up" style={{ '--delay': '0.15s' }}>{subtitle}</p>}
        <Title className={`hero__title ${titleSize === 'xl' ? 'hero__title--xl' : ''} fade-up`} style={{ '--delay': '0.3s' }}>{title}</Title>
        {cta && (
          <div className="fade-up" style={{ '--delay': '0.45s' }}>
            <Link href={cta.href} className="btn btn--light">
              <span>{cta.label}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
