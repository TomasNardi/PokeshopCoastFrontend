'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Estado del header en un solo lugar (el componente solo pinta):
 *   - megamenú abierto (uno por vez), búsqueda, drawer mobile
 *   - "stuck": hubo scroll → fondo blanco esmerilado
 *   - transparente: solo en páginas con hero (home) y sin nada abierto
 */
export function useSiteHeader({ overlay }) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [stuck, setStuck] = useState(false);
  const touchRef = useRef(false);

  const closeAll = useCallback(() => {
    setOpenId(null);
    setSearchOpen(false);
    setDrawerOpen(false);
  }, []);

  // Navegar cierra todo.
  useEffect(() => closeAll(), [pathname, closeAll]);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && closeAll();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeAll]);

  // Bloquea el scroll del body con el drawer o la búsqueda abiertos.
  useEffect(() => {
    const lock = drawerOpen || searchOpen;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen, searchOpen]);

  /** Props de cada item con megamenú: hover, foco y tablets (primer toque abre). */
  const itemHandlers = (id) => ({
    onMouseEnter: () => {
      setSearchOpen(false);
      setOpenId(id);
    },
    onMouseLeave: () => setOpenId((current) => (current === id ? null : current)),
    onFocus: () => setOpenId(id),
    onBlur: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpenId((current) => (current === id ? null : current));
    },
    onPointerDown: (event) => {
      touchRef.current = event.pointerType === 'touch';
    },
    onTopLinkClick: (event) => {
      if (touchRef.current && openId !== id) {
        event.preventDefault();
        setOpenId(id);
      }
    },
  });

  const isTransparent = overlay && !stuck && !hovered && !openId && !searchOpen;

  // Hover del header solo con mouse: en táctil, un toque emula mouseenter y el
  // header quedaría sólido "pegado" hasta tocar otra cosa.
  const hoverHandlers = {
    onPointerEnter: (event) => event.pointerType === 'mouse' && setHovered(true),
    onPointerLeave: (event) => event.pointerType === 'mouse' && setHovered(false),
  };

  return {
    openId,
    searchOpen,
    drawerOpen,
    isTransparent,
    isMenuActive: Boolean(openId) || searchOpen,
    itemHandlers,
    closeAll,
    setHovered,
    hoverHandlers,
    toggleSearch: () => {
      setOpenId(null);
      setSearchOpen((v) => !v);
    },
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    closeSearch: () => setSearchOpen(false),
  };
}
