'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CONTACT } from '@/config/site';
import WhatsappIcon from './WhatsappIcon';
import { InstagramIcon, TiktokIcon } from './SocialIcons';

const NETWORKS = [
  { label: `Instagram ${CONTACT.instagramHandle}`, href: CONTACT.instagram, Icon: InstagramIcon },
  { label: `TikTok ${CONTACT.tiktokHandle}`, href: CONTACT.tiktok, Icon: TiktokIcon },
  { label: `WhatsApp ${CONTACT.whatsappDisplay}`, href: CONTACT.whatsappUrl, Icon: WhatsappIcon },
];

/** Cuánto espera antes de entrar (ms). */
const SHOW_DELAY_MS = 5000;
/** Duración de la salida al cerrar (ms), igual que la transición del CSS. */
const HIDE_MS = 900;
/** Si se cerró, no vuelve a aparecer en esta sesión del navegador. */
const DISMISS_KEY = 'social-rail-dismissed';

const wasDismissed = () => {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

const rememberDismiss = () => {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // Sin storage (modo privado, bloqueado): solo se cierra en esta página.
  }
};

/**
 * Redes fijas al borde izquierdo, en un panel glass que se puede cerrar.
 * Entra a los pocos segundos en dos tiempos, como los textos de los heros:
 * primero se desliza el panel y después cada elemento hace fade-up
 * escalonado (--i = orden en la cascada).
 *  - Mobile y tablet: pestaña angosta con Instagram ("Instagram" en vertical).
 *  - PC ancha (≥1100px): "Seguinos" en vertical + Instagram, TikTok y WhatsApp.
 */
export default function SocialRail() {
  const [state, setState] = useState('hidden'); // hidden | visible | closed

  useEffect(() => {
    if (wasDismissed()) return undefined;
    const timer = setTimeout(() => setState('visible'), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const [removed, setRemoved] = useState(false);
  const close = () => {
    rememberDismiss();
    setState('closed');
    setTimeout(() => setRemoved(true), HIDE_MS);
  };

  if (removed) return null;
  const visible = state === 'visible';

  return (
    <aside className={`social-rail ${visible ? 'is-visible' : ''}`} aria-label="Seguinos en redes" aria-hidden={!visible}>
      <button type="button" onClick={close} className="social-rail__close social-rail__item" style={{ '--i': 0 }} aria-label="Cerrar redes" tabIndex={visible ? 0 : -1}>
        <X size={13} strokeWidth={2.4} />
      </button>

      {/* Mobile y tablet: solo Instagram. */}
      <a
        href={CONTACT.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Seguinos en Instagram ${CONTACT.instagramHandle}`}
        className="social-rail__mobile"
        tabIndex={visible ? 0 : -1}
      >
        <span className="social-rail__item" style={{ '--i': 1 }}>
          <InstagramIcon size={17} />
        </span>
        <span className="social-rail__label social-rail__item" style={{ '--i': 2 }}>Instagram</span>
      </a>

      {/* PC: las tres redes. */}
      <div className="social-rail__desktop">
        <span className="social-rail__label social-rail__item" style={{ '--i': 1 }} aria-hidden="true">Seguinos</span>
        <ul className="social-rail__list">
          {NETWORKS.map(({ label, href, Icon }, index) => (
            <li key={href} className="social-rail__item" style={{ '--i': index + 2 }}>
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="social-rail__link" tabIndex={visible ? 0 : -1}>
                <Icon size={18} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
