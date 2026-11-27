import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

const { default: PromoBanner, PROMO_KEY } = await import('@/components/layout/PromoBanner');

const BANNER = { id: 'abc', image: 'https://cdn.x/venusaur.webp', title: 'Llegó Venusaur', text: '10% off', button_label: 'Ver ofertas', button_url: '/tienda' };

describe('banner de promo', () => {
  beforeEach(() => {
    window.localStorage.clear();
    pathname = '/';
    vi.useFakeTimers();
  });

  const show = (banner = BANNER) => {
    render(<PromoBanner banner={banner} />);
    act(() => vi.advanceTimersByTime(1500));
  };

  it('aparece con la imagen, los textos y el botón', () => {
    show();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Llegó Venusaur')).toBeTruthy();
    expect(screen.getByText('Ver ofertas').getAttribute('href')).toBe('/tienda');
  });

  it('la X lo cierra y no vuelve ese día', () => {
    show();
    fireEvent.click(screen.getAllByLabelText('Cerrar')[1]);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(PROMO_KEY)).id).toBe('abc');
  });

  it('cerrado, no vuelve; un banner nuevo sí aparece', () => {
    window.localStorage.setItem(PROMO_KEY, JSON.stringify({ id: 'abc', at: Date.now() }));
    show();
    expect(screen.queryByRole('dialog')).toBeNull();
    show({ ...BANNER, id: 'nuevo' });
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('apagado en el admin o en el checkout, no aparece', () => {
    show(null);
    expect(screen.queryByRole('dialog')).toBeNull();
    pathname = '/checkout';
    show();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('solo imagen: sin textos ni botón', () => {
    show({ id: 'x', image: 'https://cdn.x/a.webp' });
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
