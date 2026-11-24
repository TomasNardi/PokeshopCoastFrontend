import { CONTACT } from '@/config/site';
import { LAUNCH_AT_MS, launchLabels } from '@/config/launch';
import DevAccess from '@/components/layout/DevAccess';
import SlabFan from '@/components/layout/SlabFan';
import { InstagramIcon, TiktokIcon } from '@/components/layout/SocialIcons';
import WhatsappIcon from '@/components/layout/WhatsappIcon';
import Countdown from './Countdown';
import LaunchNotify from './LaunchNotify';

const SOCIALS = [
  { href: CONTACT.instagram, label: 'Instagram', Icon: InstagramIcon },
  { href: CONTACT.tiktok, label: 'TikTok', Icon: TiktokIcon },
  { href: CONTACT.whatsappUrl, label: 'WhatsApp', Icon: WhatsappIcon },
];

/**
 * Página de lanzamiento: hasta el 1/12 reemplaza a todo el sitio (ver
 * config/launch.js). Mismo lenguaje que la de mantenimiento — fondo negro,
 * abanico de slabs iluminado, Barlow Condensed — con la cuenta regresiva y
 * el "avisame cuando abra".
 */
export default function LaunchPage({ launchAt = LAUNCH_AT_MS, serverNow = Date.now() }) {
  const { day, time } = launchLabels(launchAt);

  return (
    <main className="maintenance launch">
      <span className="wordmark maintenance__brand">
        <span className="wordmark__name">PokeShop</span>
        <span className="wordmark__sub">Coast</span>
      </span>

      <div className="maintenance__layout launch__layout">
        <SlabFan className="launch__stage" />

        <div className="maintenance__copy launch__copy">
          <p className="launch__eyebrow">
            <span className="maintenance__accent launch__accent" />
            Gran apertura
          </p>
          <h1 className="maintenance__title launch__title">
            La tienda abre el <span className="launch__date">{day}</span>
          </h1>
          <p className="maintenance__message launch__message">
            Singles, slabs certificados y producto sellado, con envíos a todo el país.{' '}
            <span className="launch__message-extra">Arrancamos a las {time}: dejá tu mail y te avisamos apenas abramos las puertas.</span>
          </p>

          <Countdown launchAt={launchAt} serverNow={serverNow} />

          <LaunchNotify day={day} />

          <nav className="launch__socials" aria-label="Redes de PokeShop Coast">
            <span className="launch__socials-label">Seguinos</span>
            {SOCIALS.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="launch__social" aria-label={label}>
                <Icon size={18} />
              </a>
            ))}
          </nav>
        </div>
      </div>

      <footer className="maintenance__footer">
        <p>
          ¿Tenés una consulta? Escribinos por{' '}
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a> o{' '}
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>.
        </p>
        <DevAccess />
      </footer>
    </main>
  );
}
