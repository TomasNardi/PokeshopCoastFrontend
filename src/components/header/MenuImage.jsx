/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

/**
 * Bloque con imagen del megamenú: producto flotando sobre el gris del
 * escenario, overlay negro al 20 % y título abajo a la izquierda.
 * El fade (0.75 s) y el zoom-out 1.06 → 1 (1.5 s) los maneja el CSS de .mega.
 */
export default function MenuImage({ block, delay, tabbable, onNavigate }) {
  return (
    <Link
      href={block.href}
      className="mega__image"
      style={{ transitionDelay: `${delay}ms` }}
      tabIndex={tabbable ? 0 : -1}
      onClick={onNavigate}
    >
      <span className="mega__image-wrapper" style={{ transitionDelay: `${delay}ms` }}>
        {block.image && <img src={block.image} alt="" width={600} height={838} loading="lazy" decoding="async" className="mega__image-img" />}
      </span>
      <span className="mega__image-overlay" aria-hidden="true" />
      <span className="mega__image-title">{block.title}</span>
    </Link>
  );
}
