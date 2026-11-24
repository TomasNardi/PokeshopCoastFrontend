import { CONTACT } from '@/config/site';
import DevAccess from './DevAccess';
import SlabFan from './SlabFan';

export const DEFAULT_TITLE = 'Volvemos pronto';
export const DEFAULT_MESSAGE = 'Estamos haciendo unos ajustes. Muy pronto vas a poder ver la tienda.';

/**
 * Sitio apagado desde el admin (mantenimiento, desarrollo o suspensión): se
 * muestra en todas las URLs. Título y subtítulo salen del admin; vacíos, los
 * de por defecto.
 */
export default function MaintenancePage({ title, message }) {
  return (
    <main className="maintenance">
      <span className="wordmark maintenance__brand">
        <span className="wordmark__name">PokeShop</span>
        <span className="wordmark__sub">Coast</span>
      </span>

      <div className="maintenance__layout">
        <SlabFan />

        <div className="maintenance__copy">
          <span className="maintenance__accent" />
          <h1 className="maintenance__title">{title || DEFAULT_TITLE}</h1>
          <p className="maintenance__message">{message || DEFAULT_MESSAGE}</p>
        </div>
      </div>

      <footer className="maintenance__footer">
        <p>
          ¿Tenés un pedido en curso? Escribinos por{' '}
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a> o{' '}
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>.
        </p>
        <DevAccess />
      </footer>
    </main>
  );
}
