import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { MOCK_PRODUCTS } from '@/mocks/data/products';

const bySlug = (slug) => MOCK_PRODUCTS.find((p) => p.slug === slug);

describe('<ProductCard />', () => {
  it('single: título, set, estado y precio', () => {
    render(<ProductCard product={bySlug('charizard-ex-199-151')} />);
    expect(screen.getByRole('heading', { name: 'Charizard ex 199/165' })).toBeInTheDocument();
    expect(screen.getByText('Scarlet & Violet 151')).toBeInTheDocument();
    expect(screen.getByTitle(/Desgaste mínimo/)).toHaveTextContent('Near Mint');
    expect(screen.getByText('$289.000')).toBeInTheDocument();
  });

  it('slab: nota certificada en lugar del estado', () => {
    render(<ProductCard product={bySlug('umbreon-vmax-215-evolving-skies-psa-10')} />);
    expect(screen.getByText('PSA 10')).toBeInTheDocument();
    expect(screen.queryByTitle(/Desgaste/)).not.toBeInTheDocument();
  });

  it('descuento: badge REBAJADO, precio en rojo y anterior tachado', () => {
    render(<ProductCard product={bySlug('charizard-004-base-set-lp')} />);
    expect(screen.getByText('Rebajado')).toHaveClass('badge-box');
    expect(screen.getByText('$828.000').parentElement).toHaveClass('is-sale');
    expect(screen.getByText('$920.000')).toHaveClass('old-price');
  });

  it('sin stock: cartel y sin botón de agregar', () => {
    render(<ProductCard product={bySlug('charizard-ex-006-151-sin-stock')} />);
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agregar/ })).not.toBeInTheDocument();
  });

  it('el producto flota sobre el escenario gris con la sombra separada abajo', () => {
    const { container } = render(<ProductCard product={bySlug('charizard-ex-199-151')} />);
    expect(container.querySelector('.stage.stage--card .stage__float img.stage__img')).toBeInTheDocument();
    expect(container.querySelector('.stage .stage__shadow')).toBeInTheDocument();
  });

  it('subtítulo: set + particularidades', () => {
    render(<ProductCard product={bySlug('lugia-009-neo-genesis-1st-edition')} />);
    expect(screen.getByText('Neo Genesis · 1st Edition Holo · Firmada')).toBeInTheDocument();
  });

  it('agregar al carrito suma la unidad y abre el drawer', async () => {
    useCartStore.setState({ items: [], isOpen: false });
    render(<ProductCard product={bySlug('pikachu-025-151-reverse')} />);
    await userEvent.click(screen.getByRole('button', { name: /Agregar Pikachu/ }));
    expect(useCartStore.getState().items[0]).toMatchObject({ id: 3, quantity: 1 });
    expect(useCartStore.getState().isOpen).toBe(true);
  });
});
