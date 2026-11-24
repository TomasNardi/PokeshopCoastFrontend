import { describe, expect, it } from 'vitest';
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
import MegaMenu from '@/components/header/MegaMenu';
import SiteHeader from '@/components/header/SiteHeader';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { imageStaggerDelay, linkStaggerDelays, resolveMenuImages } from '@/components/header/menuData';
import { MAIN_MENU } from '@/config/navigation';
import { MOCK_PRODUCTS } from '@/mocks/data/products';
import { createServices } from '@/services/container';

const menu = resolveMenuImages(MAIN_MENU, MOCK_PRODUCTS);
const singles = menu.find((m) => m.id === 'singles');

describe('menuData', () => {
  it('cascada de links con la fórmula del tema Broadcast (i·e+10, e·0.95)', () => {
    expect(linkStaggerDelays(4).map(Math.round)).toEqual([10, 58, 100, 139]);
  });

  it('imágenes cada 100 ms', () => {
    expect([0, 1, 2].map(imageStaggerDelay)).toEqual([0, 100, 200]);
  });

  it('cada bloque del megamenú resuelve una imagen del catálogo de su categoría', () => {
    const slabs = menu.find((m) => m.id === 'slabs');
    const slabImages = MOCK_PRODUCTS.filter((p) => p.category.slug === 'slabs').map((p) => p.image_url);
    slabs.blocks.forEach((block) => expect(slabImages).toContain(block.image));
  });

  it('sin productos de la categoría usa cualquier imagen (nunca queda un bloque vacío si hay catálogo)', () => {
    const [item] = resolveMenuImages([{ id: 'x', blocks: [{ title: 'X', href: '/', from: { category: 'nada' } }] }], MOCK_PRODUCTS);
    expect(item.blocks[0].image).toBeTruthy();
  });
});

describe('<MegaMenu />', () => {
  it('cerrado: oculto y sin links tabulables', () => {
    const { container } = render(<MegaMenu item={singles} id="m" open={false} />);
    expect(container.firstChild).not.toHaveClass('is-visible');
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    screen.getAllByRole('link', { hidden: true }).forEach((a) => expect(a).toHaveAttribute('tabindex', '-1'));
  });

  it('abierto: visible, links con delays en cascada e imágenes escalonadas', () => {
    const { container } = render(<MegaMenu item={singles} id="m" open />);
    expect(container.firstChild).toHaveClass('is-visible');
    const links = container.querySelectorAll('.mega__link');
    expect(links[0].style.transitionDelay).toBe('10ms');
    expect(links[1].style.transitionDelay).toBe('57.5ms');
    const images = container.querySelectorAll('.mega__image');
    expect([...images].map((i) => i.style.transitionDelay)).toEqual(['0ms', '100ms', '200ms']);
    expect(screen.getByText('Ofertas')).toHaveClass('mega__image-title');
  });
});

describe('<SiteHeader />', () => {
  // La sesión mock llega en un microtask: se espera dentro de act() para que
  // el SessionProvider termine de actualizar antes de cada aserción.
  const renderHeader = async () => {
    const view = render(
      <SessionProvider services={createServices({ useMocks: true, supabase: null })}>
        <SiteHeader menu={menu} popularProducts={MOCK_PRODUCTS.slice(0, 4)} />
      </SessionProvider>
    );
    await act(async () => {});
    return view;
  };

  it('en la home (pathname "/") arranca transparente sobre el hero', async () => {
    const { container } = await renderHeader();
    expect(container.querySelector('.site-header')).toHaveClass('site-header--overlay', 'is-transparent');
  });

  it('pasar el mouse sobre el header lo pone sólido; un toque (touch/pen) no lo deja pegado', async () => {
    const { container } = await renderHeader();
    const header = container.querySelector('.site-header');
    // jsdom no implementa PointerEvent.pointerType: se arma el evento a mano.
    // React deriva onPointerEnter/Leave de pointerover/pointerout.
    const pointer = (type, pointerType) => {
      const event = createEvent[type](header);
      Object.defineProperty(event, 'pointerType', { value: pointerType });
      fireEvent(header, event);
    };

    pointer('pointerOver', 'touch');
    expect(header).toHaveClass('is-transparent');
    pointer('pointerOut', 'touch');

    pointer('pointerOver', 'mouse');
    expect(header).toHaveClass('is-solid');
    pointer('pointerOut', 'mouse');
    expect(header).toHaveClass('is-transparent');
  });

  it('hover en un item abre su megamenú, oscurece la página y pasa a fondo sólido', async () => {
    const { container } = await renderHeader();
    const item = screen.getByRole('link', { name: /Singles/ }).closest('li');
    fireEvent.mouseEnter(item);
    expect(container.querySelector('#mega-singles')).toHaveClass('is-visible');
    expect(container.querySelector('.header-underlay')).toHaveClass('is-visible');
    expect(container.querySelector('.site-header')).toHaveClass('is-solid');
    fireEvent.mouseLeave(item);
    expect(container.querySelector('#mega-singles')).not.toHaveClass('is-visible');
  });

  it('un solo megamenú abierto a la vez y Escape cierra', async () => {
    const { container } = await renderHeader();
    fireEvent.mouseEnter(screen.getByRole('link', { name: /Singles/ }).closest('li'));
    fireEvent.mouseEnter(screen.getByRole('link', { name: /Slabs/ }).closest('li'));
    expect(container.querySelectorAll('.mega.is-visible:not(.search-pop)')).toHaveLength(1);
    act(() => fireEvent.keyDown(document, { key: 'Escape' }));
    expect(container.querySelectorAll('.mega.is-visible')).toHaveLength(0);
  });

  it('la lupa abre la búsqueda con productos populares', async () => {
    const { container } = await renderHeader();
    fireEvent.click(screen.getAllByRole('button', { name: 'Buscar' })[0]);
    expect(container.querySelector('.search-pop')).toHaveClass('is-visible');
    expect(screen.getByText('Productos populares')).toBeInTheDocument();
  });

  it('el menú mobile se abre desde la hamburguesa', async () => {
    const { container } = await renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(container.querySelector('.drawer')).toHaveClass('is-open');
  });

  it('menú mobile tipo sliderule: tocar una categoría desliza su submenú y "atrás" vuelve', async () => {
    const { container } = await renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const nav = container.querySelector('.sliderule');
    const panel = () => container.querySelector('.sliderule__panel.is-visible');

    fireEvent.click(container.querySelector('.sliderule__main button.sliderow'));
    expect(nav).toHaveClass('is-sub');
    expect(panel()).not.toBeNull();
    expect(panel()).toHaveAttribute('aria-hidden', 'false');

    fireEvent.click(panel().querySelector('.sliderow--back'));
    expect(nav).not.toHaveClass('is-sub');
    expect(panel()).toBeNull();
  });
});
