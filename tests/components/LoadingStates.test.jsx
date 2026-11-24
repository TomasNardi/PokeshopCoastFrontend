import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ProductCardSkeleton, ProductGridSkeleton, ProductRailSkeleton } from '@/components/product/ProductSkeletons';
import { CartPageSkeleton, CheckoutSkeleton } from '@/components/cart/CartSkeletons';
import NavigationProgress, { signalNavigationStart } from '@/components/layout/NavigationProgress';

describe('esqueletos de carga', () => {
  it('la grilla anuncia la carga UNA vez y dibuja las cards pedidas', () => {
    const { container } = render(<ProductGridSkeleton count={6} />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelectorAll('.product-item')).toHaveLength(6);
  });

  it('la card falsa usa las mismas clases que la real (mismo tamaño, sin saltos)', () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.querySelector('.product-item__media .stage.stage--card')).toBeInTheDocument();
    for (const cls of ['product-item__title', 'product-item__category', 'product-item__price']) {
      expect(container.querySelector(`.${cls} .skeleton`)).toBeInTheDocument();
    }
  });

  it('el rail muestra su título real mientras cargan los productos', () => {
    render(<ProductRailSkeleton title="Nuevos ingresos" />);
    expect(screen.getByRole('heading', { name: 'Nuevos ingresos' })).toBeInTheDocument();
    expect(screen.getByText('Cargando nuevos ingresos…')).toHaveClass('sr-only');
  });

  it('carrito y checkout tienen esqueleto accesible', () => {
    render(<><CartPageSkeleton /><CheckoutSkeleton /></>);
    expect(screen.getByText('Cargando tu carrito…')).toBeInTheDocument();
    expect(screen.getByText('Cargando el checkout…')).toBeInTheDocument();
  });
});

describe('<NavigationProgress />', () => {
  const bar = (container) => container.querySelector('.nav-progress');
  // jsdom no navega: se cancela el clic al final del burbujeo (después de que
  // NavigationProgress lo vio) para que no ensucie la salida con "Not implemented".
  const stopNavigation = (event) => event.preventDefault();
  beforeEach(() => window.addEventListener('click', stopNavigation));
  afterEach(() => window.removeEventListener('click', stopNavigation));

  it('un clic en un link interno a otra página muestra la barra (pasado el umbral)', () => {
    vi.useFakeTimers();
    const { container } = render(
      <>
        <NavigationProgress />
        <a href="/tienda">Tienda</a>
      </>
    );
    fireEvent.click(screen.getByText('Tienda'));
    expect(bar(container)).toHaveClass('is-idle');
    act(() => vi.advanceTimersByTime(150));
    expect(bar(container)).toHaveClass('is-loading');
    // Tope de seguridad: nunca queda colgada.
    act(() => vi.advanceTimersByTime(16000));
    expect(bar(container)).not.toHaveClass('is-loading');
    vi.useRealTimers();
  });

  it('ignora links externos, anclas de la misma página y clics con Ctrl', () => {
    vi.useFakeTimers();
    const { container } = render(
      <>
        <NavigationProgress />
        <a href="https://instagram.com/x">IG</a>
        <a href="#nuevos-ingresos">Ancla</a>
        <a href="/tienda">Tienda</a>
      </>
    );
    fireEvent.click(screen.getByText('IG'));
    fireEvent.click(screen.getByText('Ancla'));
    fireEvent.click(screen.getByText('Tienda'), { ctrlKey: true });
    act(() => vi.advanceTimersByTime(300));
    expect(bar(container)).toHaveClass('is-idle');
    vi.useRealTimers();
  });

  it('las navegaciones por código (filtros, buscador) también la muestran', () => {
    vi.useFakeTimers();
    const { container } = render(<NavigationProgress />);
    act(() => signalNavigationStart());
    act(() => vi.advanceTimersByTime(150));
    expect(bar(container)).toHaveClass('is-loading');
    vi.useRealTimers();
  });
});
