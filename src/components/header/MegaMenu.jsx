import Link from 'next/link';
import { imageStaggerDelay, linkStaggerDelays } from './menuData';
import MenuImage from './MenuImage';

/**
 * Megamenú a todo el ancho (réplica del "grandparent" del tema Broadcast):
 * columna de links que aparecen en cascada + 3 imágenes con fade y zoom.
 * Los retrasos son los mismos que calcula el theme.js original.
 */
export default function MegaMenu({ item, id, open, onNavigate }) {
  const delays = linkStaggerDelays(item.links.length);

  return (
    <div id={id} className={`mega ${open ? 'is-visible' : ''}`} aria-hidden={!open}>
      <div className="mega__inner">
        <nav className="mega__links" aria-label={item.label}>
          {item.links.map((link, index) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="mega__link"
              style={{ transitionDelay: `${delays[index]}ms` }}
              tabIndex={open ? 0 : -1}
              onClick={onNavigate}
            >
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mega__blocks">
          {item.blocks.map((block, index) => (
            <div key={block.title + index} className="mega__block">
              <MenuImage block={block} delay={imageStaggerDelay(index)} tabbable={open} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
