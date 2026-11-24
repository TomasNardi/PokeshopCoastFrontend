import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('la carta va apoyada en el escenario, sin sombra ni brillo', () => {
    const { container } = render(<ProductCard product={bySlug('charizard-ex-199-151')} />);
    expect(container.querySelector('.stage.stage--card .stage__card img.stage__img')).toBeInTheDocument();
    expect(container.querySelector('.stage__glare')).not.toBeInTheDocument();
    expect(container.querySelector('.stage__shadow')).not.toBeInTheDocument();
  });

  it('sellado: zoom en hover, sin tilt', () => {
    const sealed = MOCK_PRODUCTS.find((p) => p.category?.slug === 'sellados');
    const { container } = render(<ProductCard product={sealed} />);
    expect(container.querySelector('.stage.stage--zoom img.stage__img')).toBeInTheDocument();
    expect(container.querySelector('.stage__glare')).not.toBeInTheDocument();
  });

  it('1st Edition, firmada, etc. van como insignias con ícono; el subtítulo queda para el set', () => {
    render(<ProductCard product={bySlug('lugia-009-neo-genesis-1st-edition')} />);
    expect(screen.getByText('Neo Genesis')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '1st Edition' })).toHaveAttribute('src', '/insignias/primera.svg');
    expect(screen.getByRole('img', { name: 'Firmada' })).toHaveAttribute('src', '/insignias/firmada.svg');
    expect(screen.queryByRole('img', { name: 'Reverse Holo' })).not.toBeInTheDocument();
  });

  it('una reverse muestra su insignia', () => {
    render(<ProductCard product={bySlug('pikachu-025-151-reverse')} />);
    expect(screen.getByRole('img', { name: 'Reverse Holo' })).toBeInTheDocument();
  });

  it('agregar al carrito: anillo de carga → check → suma la unidad y abre el drawer', async () => {
    useCartStore.setState({ items: [], isOpen: false });
    render(<ProductCard product={bySlug('pikachu-025-151-reverse')} />);
    const button = screen.getByRole('button', { name: /Agregar Pikachu/ });
    await userEvent.click(button);
    expect(button).toHaveClass('is-loading');
    await waitFor(() => expect(button).toHaveClass('is-added'), { timeout: 2000 });
    expect(useCartStore.getState().items[0]).toMatchObject({ id: 3, quantity: 1 });
    await waitFor(() => expect(useCartStore.getState().isOpen).toBe(true), { timeout: 2000 });
  });
});
