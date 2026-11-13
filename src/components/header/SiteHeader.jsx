'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { selectCount, useCartStore } from '@/store/cartStore';
import { useHydrated } from '@/hooks/useHydrated';
import { useSession } from '@/components/auth/SessionProvider';
import Wordmark from '@/components/layout/Wordmark';
import MegaMenu from './MegaMenu';
import SearchPopdown from './SearchPopdown';
import MobileDrawer from './MobileDrawer';
import { useSiteHeader } from './useSiteHeader';

/** Rutas cuyo primer bloque es un hero a todo el ancho: el header va transparente encima. */
const OVERLAY_ROUTES = new Set(['/']);

function Caret() {
  return (
    <svg className="nav-caret" width="10" height="7" viewBox="0 0 10 7" aria-hidden="true">
      <path d="M1 1.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/**
 * Header estilo tema Broadcast (unsobremas.com): menú a la izquierda, logo
 * centrado e íconos a la derecha. Transparente sobre el hero de la home,
 * blanco esmerilado al hacer scroll / hover / abrir un megamenú.
 *
 * @param {{ menu: Array, popularProducts: Array }} props menú con imágenes ya resueltas (server)
 */
export default function SiteHeader({ menu, popularProducts = [] }) {
  const pathname = usePathname();
  const overlay = OVERLAY_ROUTES.has(pathname);
  const header = useSiteHeader({ overlay });
  const hydrated = useHydrated();
  const count = useCartStore(selectCount);
  const openCart = useCartStore((s) => s.open);
  const { isAuthenticated, status } = useSession();
  const accountHref = isAuthenticated ? '/cuenta' : '/cuenta/ingresar';
  const cartCount = hydrated ? count : 0;

  return (
    <>
      <div
        className={`site-header ${overlay ? 'site-header--overlay' : ''} ${header.isTransparent ? 'is-transparent' : 'is-solid'} ${header.isMenuActive ? 'is-menu-open' : ''}`}
        {...header.hoverHandlers}
      >
        <header className="site-header__bar" role="banner">
          {/* Mobile / tablet */}
          <div className="site-header__row grid xl:hidden">
            <div className="flex items-center">
              <button type="button" className="header-icon" onClick={header.openDrawer} aria-label="Abrir menú" aria-expanded={header.drawerOpen}>
                <Menu size={24} strokeWidth={2} />
              </button>
              <button type="button" className="header-icon" onClick={header.toggleSearch} aria-label="Buscar" aria-expanded={header.searchOpen}>
                <Search size={22} strokeWidth={2} />
              </button>
            </div>
            <Wordmark />
            {/* Como unsobremas: cuenta + carrito a la derecha. */}
            <div className="flex items-center justify-end">
              {status !== 'disabled' && (
                <Link href={accountHref} className="header-icon" aria-label="Mi cuenta">
                  <User size={22} strokeWidth={2} />
                </Link>
              )}
              <button type="button" className="header-icon" onClick={openCart} aria-label={`Carrito (${cartCount})`}>
                <ShoppingBag size={22} strokeWidth={2} />
                {cartCount > 0 && <span className="header-icon__count">{cartCount}</span>}
              </button>
            </div>
          </div>

          {/* Desktop */}
          <div className="site-header__row hidden xl:grid">
            <nav aria-label="Principal" className="h-full">
              <ul className="nav-menu">
                {menu.map((item) => {
                  if (!item.links) {
                    return (
                      <li key={item.id} className="nav-menu__item">
                        <Link href={item.href} className={`navlink ${item.highlight ? 'navlink--highlight' : ''}`}>
                          <span className="navtext">{item.label}</span>
                        </Link>
                      </li>
                    );
                  }
                  const { onTopLinkClick, ...handlers } = header.itemHandlers(item.id);
                  const open = header.openId === item.id;
                  const dropdownId = `mega-${item.id}`;
                  return (
                    <li key={item.id} className="nav-menu__item" {...handlers}>
                      <Link
                        href={item.href}
                        className={`navlink ${open ? 'is-active' : ''}`}
                        aria-haspopup="true"
                        aria-expanded={open}
                        aria-controls={dropdownId}
                        onClick={onTopLinkClick}
                      >
                        <span className="navtext">
                          {item.label}
                          <Caret />
                        </span>
                      </Link>
                      <MegaMenu item={item} id={dropdownId} open={open} onNavigate={header.closeAll} />
                    </li>
                  );
                })}
              </ul>
            </nav>

            <Wordmark />

            <div className="flex items-center justify-end">
              <button type="button" className="header-icon" onClick={header.toggleSearch} aria-label="Buscar" aria-expanded={header.searchOpen}>
                <Search size={22} strokeWidth={2} />
              </button>
              {status !== 'disabled' && (
                <Link href={accountHref} className="header-icon" aria-label="Mi cuenta">
                  <User size={22} strokeWidth={2} />
                </Link>
              )}
              <button type="button" className="header-icon" onClick={openCart} aria-label={`Carrito (${cartCount})`}>
                <ShoppingBag size={22} strokeWidth={2} />
                {cartCount > 0 && <span className="header-icon__count">{cartCount}</span>}
              </button>
            </div>
          </div>

          <SearchPopdown open={header.searchOpen} onClose={header.closeSearch} popularProducts={popularProducts} />
        </header>
      </div>

      {/* Oscurece la página detrás del megamenú / búsqueda (hover__bg del tema). */}
      <div className={`header-underlay ${header.isMenuActive ? 'is-visible' : ''}`} onClick={header.closeAll} aria-hidden="true" />

      <MobileDrawer menu={menu} open={header.drawerOpen} onClose={header.closeDrawer} accountHref={accountHref} />
    </>
  );
}
