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
import CartDrawer from '@/components/cart/CartDrawer';
import { PRESENTATION_MODE } from '@/config/env';

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

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Cartas Pokémon TCG en Argentina`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: { type: 'website', locale: SITE.locale, siteName: SITE.name, url: SITE.url },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }) {
  // Las imágenes del megamenú salen del catálogo (nunca rompe: devuelve [] si falla).
  const { catalog } = getServices();
  const [featured, newArrivals] = await Promise.all([catalog.getFeatured(), catalog.getNewArrivals()]);
  const menu = resolveMenuImages(MAIN_MENU, [...featured, ...newArrivals]);

  return (
    <html lang="es" className={`${roboto.variable} ${robotoCondensed.variable} ${barlowCondensed.variable}`}>
      <body>
        <Providers>
          <div className="bg-black py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-white">
            {TOP_BANNER_MESSAGE}
          </div>
          <SiteHeader menu={menu} popularProducts={featured} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          {!PRESENTATION_MODE && <CartDrawer />}
          <FloatingContact />
        </Providers>
      </body>
    </html>
  );
}
