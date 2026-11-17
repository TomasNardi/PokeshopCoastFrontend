/* eslint-disable @next/next/no-img-element */
import { CONTACT, SITE } from '@/config/site';
import { HOME_HEROES } from '@/config/home';

const DEFAULT_MESSAGE = 'Estamos acomodando las cartas y cargando stock nuevo. Volvemos muy pronto.';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.98 1-3.63-.24-.37a9.8 9.8 0 0 1-1.5-5.2c0-5.42 4.42-9.83 9.84-9.83 2.62 0 5.09 1.03 6.95 2.88a9.77 9.77 0 0 1 2.88 6.96c0 5.42-4.42 9.82-9.84 9.82zm8.37-18.2A11.76 11.76 0 0 0 12.04.13C5.5.13.18 5.45.18 11.98c0 2.09.55 4.13 1.59 5.93L.08 24l6.24-1.64a11.8 11.8 0 0 0 5.71 1.46h.01c6.53 0 11.85-5.32 11.85-11.86 0-3.17-1.23-6.15-3.48-8.39z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Sitio en mantenimiento: se muestra en todas las URLs cuando en el admin se
 * apaga "Sitio activo". Misma estética que el hero del home (negro con el
 * collage de cartas fundido a la derecha) para que se sienta parte del sitio.
 */
export default function MaintenancePage({ message }) {
  const image = HOME_HEROES.main.image;
  return (
    <div className="maintenance">
      <div className="maintenance__art" aria-hidden="true">
        <img src={image.desktop} alt="" fetchPriority="high" />
      </div>
      <div className="maintenance__shade" aria-hidden="true" />

      <header className="maintenance__brand fade-up" style={{ '--delay': '0s' }}>
        <span className="wordmark">
          <span className="wordmark__name">PokeShop</span>
          <span className="wordmark__sub">Coast</span>
        </span>
      </header>

      <main className="maintenance__content">
        <p className="maintenance__badge fade-up" style={{ '--delay': '0.1s' }}>
          <span className="maintenance__dot" aria-hidden="true" />
          En mantenimiento
        </p>
        <h1 className="maintenance__title fade-up" style={{ '--delay': '0.2s' }}>
          Volvemos
          <br />
          en un rato
        </h1>
        <p className="maintenance__message fade-up" style={{ '--delay': '0.3s' }}>{message || DEFAULT_MESSAGE}</p>
        <div className="maintenance__actions fade-up" style={{ '--delay': '0.4s' }}>
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn--light">
            <WhatsAppIcon />
            <span>Escribinos</span>
          </a>
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="maintenance__link">
            <InstagramIcon />
            <span>{CONTACT.instagramHandle}</span>
          </a>
        </div>
      </main>

      <footer className="maintenance__footer fade-up" style={{ '--delay': '0.5s' }}>
        © {new Date().getFullYear()} {SITE.name} · {CONTACT.location}
      </footer>
    </div>
  );
}
