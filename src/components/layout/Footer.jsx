import Link from 'next/link';
import { CONTACT, SITE } from '@/config/site';
import { CATEGORIES } from '@/domain/catalog';
import BrandLogo from './BrandLogo';
import { PRESENTATION_MODE } from '@/config/presentation';

const ALL_COLUMNS = [
  { title: 'Tienda', links: [...CATEGORIES.map((c) => ({ label: c.name, href: `/tienda?category=${c.slug}` })), { label: 'Outlet', href: '/outlet' }] },
  {
    title: 'Ayuda',
    links: [
      { label: 'Envíos', href: '/envios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Mi cuenta', href: '/cuenta' },
      { label: 'Cambios y devoluciones', href: '/cambios-y-devoluciones' },
      { label: 'Términos', href: '/terminos' },
      { label: 'Privacidad', href: '/privacidad' },
    ],
  },
  {
    title: 'Contacto',
    links: [
      { label: CONTACT.email, href: `mailto:${CONTACT.email}`, external: true },
      { label: CONTACT.whatsappDisplay, href: CONTACT.whatsappUrl, external: true },
      { label: CONTACT.locationShort },
      // Res. 424/2020: acceso directo desde cualquier página, sin registrarse.
      { label: 'Botón de arrepentimiento', href: '/arrepentimiento', strong: true },
    ],
  },
  {
    title: 'Seguinos',
    links: [
      { label: 'Instagram', href: CONTACT.instagram, external: true },
      { label: 'TikTok', href: CONTACT.tiktok, external: true },
      { label: 'WhatsApp', href: CONTACT.whatsappUrl, external: true },
    ],
  },
];

// Modo presentación: solo "Seguinos" (las otras columnas llevan a secciones ocultas).
const COLUMNS = PRESENTATION_MODE ? ALL_COLUMNS.filter((col) => col.title === 'Seguinos') : ALL_COLUMNS;

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-coast-line bg-coast-cream-deep">
      <div className="container-site grid grid-cols-2 gap-10 pb-10 pt-16 lg:grid-cols-6">
        <div className="col-span-2 mx-auto flex w-full max-w-sm flex-col items-center text-center">
          <BrandLogo />
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-coast-gray">{SITE.description}</p>
          <p className="mt-6 text-[12px] font-semibold text-coast-ink">Pagos seguros con Mercado Pago · Envíos a todo el país</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="eyebrow mb-5 text-coast-red/80">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {!link.href ? (
                    <span className="text-[13px] text-coast-gray">{link.label}</span>
                  ) : link.strong ? (
                    <Link href={link.href} className="inline-flex items-center gap-1.5 border border-coast-ink px-2.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.04em] text-coast-ink hover:bg-coast-ink hover:text-white">
                      {link.label}
                    </Link>
                  ) : link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="break-all text-[13px] text-coast-gray hover:text-coast-ink">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-[13px] text-coast-gray hover:text-coast-ink">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-site flex flex-col items-center justify-between gap-2 border-t border-coast-line py-6 pb-24 text-center text-[11px] text-coast-mist md:flex-row md:pb-6 md:text-left">
        <p>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
        <p>Pokémon y sus marcas son propiedad de sus respectivos dueños. Tienda independiente.</p>
      </div>
    </footer>
  );
}
