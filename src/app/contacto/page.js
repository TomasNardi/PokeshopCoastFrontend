import { AtSign, Clock, Mail, MapPin, MessageCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ContactForm from '@/components/contact/ContactForm';
import { CONTACT } from '@/config/site';

export const metadata = { title: 'Contacto', description: 'Escribinos por WhatsApp, email o formulario.' };

const CHANNELS = [
  { icon: MessageCircle, label: 'WhatsApp', value: CONTACT.whatsappDisplay, href: CONTACT.whatsappUrl, external: true },
  { icon: Mail, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { icon: AtSign, label: 'Instagram', value: CONTACT.instagramHandle, href: CONTACT.instagram, external: true },
  { icon: AtSign, label: 'TikTok', value: CONTACT.tiktokHandle, href: CONTACT.tiktok, external: true },
  { icon: MapPin, label: 'Ubicación', value: CONTACT.location },
  { icon: Clock, label: 'Horario', value: CONTACT.hours },
];

export default function ContactoPage() {
  return (
    <>
      <PageHeader eyebrow="Contacto" title="Hablemos">
        Consultas sobre cartas, pedidos, envíos o si querés vendernos tu colección.
      </PageHeader>
      <div className="container-site grid gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-coast-line bg-white p-6 sm:p-10">
          <ContactForm />
        </div>
        <ul className="space-y-6">
          {CHANNELS.map(({ icon: Icon, label, value, href, external }) => {
            const content = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coast-red-soft text-coast-red">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-coast-mist">{label}</span>
                  <span className="mt-0.5 block text-[15px] text-coast-ink">{value}</span>
                </span>
              </>
            );
            return (
              <li key={label}>
                {href ? (
                  <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="flex items-center gap-4 hover:opacity-80">
                    {content}
                  </a>
                ) : (
                  <div className="flex items-center gap-4">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
