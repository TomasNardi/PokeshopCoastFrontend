import { Barlow_Condensed, Roboto, Roboto_Condensed } from 'next/font/google';
import './globals.css';
import { SITE, TOP_BANNER_MESSAGE } from '@/config/site';
import { MAIN_MENU } from '@/config/navigation';
import { getServices } from '@/services/container';
import { resolveMenuImages } from '@/components/header/menuData';
import Providers from '@/components/layout/Providers';
import SiteHeader from '@/components/header/SiteHeader';
import Footer from '@/components/layout/Footer';
import FloatingContact from '@/components/layout/FloatingContact';
import CookieBanner from '@/components/layout/CookieBanner';
import SocialRail from '@/components/layout/SocialRail';
import CartDrawer from '@/components/cart/CartDrawer';
import { PRESENTATION_MODE } from '@/config/presentation';
import PresentationGuard from '@/components/layout/PresentationGuard';
import NavigationProgress from '@/components/layout/NavigationProgress';
import MaintenancePage from '@/components/layout/MaintenancePage';
import { getMaintenanceState } from '@/services/site/siteStatus';

// Mismas familias que unsobremas.com (Wappalyzer → Google Font API).
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto', display: 'swap' });
const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['700'],
  style: ['normal', 'italic'],
  variable: '--font-roboto-condensed',
  display: 'swap',
});
const barlowCondensed = Barlow_Condensed({ subsets: ['latin'], weight: ['700'], variable: '--font-barlow-condensed', display: 'swap' });

export const viewport = {
  themeColor: '#FCFCFC',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

const BASE_METADATA = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Cartas Pokémon TCG en Argentina`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  // Paquete de RealFaviconGenerator en /public. Sin favicon.svg a propósito:
  // el que venía pesaba 1,6 MB (un PNG embebido) y los navegadores lo preferirían.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
  appleWebApp: { title: SITE.name },
  openGraph: { type: 'website', locale: SITE.locale, siteName: SITE.name, url: SITE.url },
  robots: { index: true, follow: true },
};

// En mantenimiento (y en la vista previa del dueño) Google no indexa: si lo
// hiciera, guardaría la página de "volvemos en un rato" en vez de la tienda.
export async function generateMetadata() {
  const { status } = await getMaintenanceState();
  if (status.isActive) return BASE_METADATA;
  return { ...BASE_METADATA, title: `${SITE.name} — Volvemos pronto`, robots: { index: false, follow: false } };
}

export default async function RootLayout({ children }) {
  const fonts = `${roboto.variable} ${robotoCondensed.variable} ${barlowCondensed.variable}`;

  // Sitio apagado desde el admin → solo la página de mantenimiento, en
  // cualquier URL. Si el backend no responde, el sitio queda abierto.
  const { status, maintenance } = await getMaintenanceState();
  if (maintenance) {
    return (
      <html lang="es" className={fonts}>
        <body>
          <MaintenancePage title={status.maintenanceTitle} message={status.maintenanceMessage} />
        </body>
      </html>
    );
  }

  // Las imágenes del megamenú salen del catálogo (nunca rompe: devuelve [] si falla).
  const { catalog } = getServices();
  const [featured, newArrivals] = await Promise.all([catalog.getFeatured(), catalog.getNewArrivals()]);
  const menu = resolveMenuImages(MAIN_MENU, [...featured, ...newArrivals]);

  return (
    <html lang="es" className={fonts}>
      <body>
        <Providers>
          <NavigationProgress />
          {!status.isActive && (
            <div className="bg-coast-red py-2 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-white">
              Vista previa · el sitio está en mantenimiento para el público ·{' '}
              <a href="/vista-previa?salir=1" className="underline underline-offset-2">Salir</a>
            </div>
          )}
          {status.showTopBanner && (
            <div className="bg-black py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-white">
              {status.topBannerMessage || TOP_BANNER_MESSAGE}
            </div>
          )}
          <SiteHeader menu={menu} popularProducts={featured} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CartDrawer />
          {PRESENTATION_MODE && <PresentationGuard />}
          <SocialRail />
          <FloatingContact />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
