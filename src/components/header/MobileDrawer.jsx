'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CONTACT } from '@/config/site';
import WhatsappIcon from '@/components/layout/WhatsappIcon';
import { InstagramIcon, TiktokIcon } from '@/components/layout/SocialIcons';

/** Tiempo de la transición del panel (igual que en globals.css). */
const SLIDE_MS = 450;

/**
 * Menú mobile al estilo "sliderule" del tema Broadcast (unsobremas.com):
 * panel desde la izquierda con filas grandes en mayúsculas y flecha ›; al
 * tocar una categoría se desliza su submenú, con "‹ Categoría" arriba para volver.
 */
export default function MobileDrawer({ menu, open, onClose, accountHref }) {
  const [panelId, setPanelId] = useState(null);

  // Al cerrar, vuelve al primer nivel (después de la animación para que no "salte").
  useEffect(() => {
    if (open) return undefined;
    const timer = setTimeout(() => setPanelId(null), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [open]);

  const inMain = open && !panelId;
  const tab = (focusable) => (focusable ? 0 : -1);

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__underlay" onClick={onClose} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Menú">
        <div className="drawer__head">
          <button type="button" onClick={onClose} aria-label="Cerrar menú" className="drawer__close" tabIndex={tab(open)}>
            <X size={24} strokeWidth={1.8} />
          </button>
        </div>

        <nav className={`sliderule ${panelId ? 'is-sub' : ''}`} aria-label="Menú principal">
          <ul className="sliderule__pane sliderule__main" aria-hidden={Boolean(panelId)}>
            {menu.map((item) => (
              <li key={item.id}>
                {item.links ? (
                  <button type="button" className="sliderow" onClick={() => setPanelId(item.id)} aria-expanded={panelId === item.id} tabIndex={tab(inMain)}>
                    <span>{item.label}</span>
                    <ChevronRight size={22} strokeWidth={1.6} className="sliderow__chevron" aria-hidden="true" />
                  </button>
                ) : (
                  <Link href={item.href} onClick={onClose} className={`sliderow ${item.highlight ? 'sliderow--highlight' : ''}`} tabIndex={tab(inMain)}>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {menu
            .filter((item) => item.links)
            .map((item) => {
              const visible = open && panelId === item.id;
              return (
                <div key={item.id} className={`sliderule__pane sliderule__panel ${panelId === item.id ? 'is-visible' : ''}`} aria-hidden={!visible}>
                  <button type="button" className="sliderow sliderow--back" onClick={() => setPanelId(null)} tabIndex={tab(visible)}>
                    <ChevronLeft size={22} strokeWidth={1.6} className="sliderow__back-icon" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                  <ul>
                    {item.links.map((link) => (
                      <li key={link.href + link.label}>
                        <Link href={link.href} onClick={onClose} className="sliderow sliderow--link" tabIndex={tab(visible)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </nav>

        <div className="drawer__bottom">
          <Link href={accountHref} onClick={onClose} className="drawer__bottom-link" tabIndex={tab(open)}>
            Mi cuenta
          </Link>
          <div className="drawer__social">
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" tabIndex={tab(open)}>
              <InstagramIcon size={20} />
            </a>
            <a href={CONTACT.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" tabIndex={tab(open)}>
              <TiktokIcon size={20} />
            </a>
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" tabIndex={tab(open)}>
              <WhatsappIcon size={20} />
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
