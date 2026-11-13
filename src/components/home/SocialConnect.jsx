import { CONTACT } from '@/config/site';
import WhatsappIcon from '@/components/layout/WhatsappIcon';
import { InstagramIcon, TiktokIcon } from '@/components/layout/SocialIcons';

const NETWORKS = [
  { label: `Instagram ${CONTACT.instagramHandle}`, href: CONTACT.instagram, Icon: InstagramIcon },
  { label: `TikTok ${CONTACT.tiktokHandle}`, href: CONTACT.tiktok, Icon: TiktokIcon },
  { label: `WhatsApp ${CONTACT.whatsappDisplay}`, href: CONTACT.whatsappUrl, Icon: WhatsappIcon },
];

/**
 * "Conectá con nosotros" (estilo magic.wizards.com): título chico en mayúsculas
 * muy espaciadas y una fila centrada de íconos negros, sin cajas ni fondos.
 */
export default function SocialConnect() {
  return (
    <section className="container-site py-12 text-center md:py-16" aria-labelledby="social-connect-title">
      <h2 id="social-connect-title" className="text-[13px] font-bold uppercase tracking-[0.35em] text-black md:text-[14px]">
        Conectá con nosotros
      </h2>
      <ul className="mt-5 flex items-center justify-center gap-7">
        {NETWORKS.map(({ label, href, Icon }) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="block text-black transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:opacity-70"
            >
              <Icon size={28} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
