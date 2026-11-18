import { CONTACT } from '@/config/site';

const DEFAULT_MESSAGE = 'Estamos haciendo unos ajustes. Volvemos pronto.';

/** Sitio en mantenimiento: se muestra en todas las URLs cuando en el admin se apaga "Sitio activo". */
export default function MaintenancePage({ message }) {
  return (
    <main className="maintenance">
      <span className="wordmark">
        <span className="wordmark__name">PokeShop</span>
        <span className="wordmark__sub">Coast</span>
      </span>
      <div>
        <h1 className="maintenance__title">Volvemos pronto</h1>
        <p className="maintenance__message mt-4">{message || DEFAULT_MESSAGE}</p>
      </div>
      <p className="maintenance__contact">
        ¿Tenés un pedido en curso? Escribinos por{' '}
        <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a> o{' '}
        <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>.
      </p>
    </main>
  );
}
