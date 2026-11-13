import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMockCatalogRepository, filterProducts } from '@/services/catalog/catalogRepository.mock';
import { createCatalogService } from '@/services/catalog/catalogService';
import { normalizeFilters } from '@/domain/catalog';
import { productView } from '@/domain/product';
import { MOCK_PRODUCTS } from '@/mocks/data/products';
import ProductCard from '@/components/product/ProductCard';
import DamageNote from '@/components/product/DamageNote';

describe('Outlet', () => {
  it('"outlet" es un filtro válido de la tienda (viaja al backend)', () => {
    expect(normalizeFilters({ outlet: 'true' })).toMatchObject({ outlet: 'true' });
  });

  it('filtra solo productos outlet', async () => {
    const catalog = createCatalogService(createMockCatalogRepository());
    const page = await catalog.getProductPage({ outlet: 'true' });
    expect(page.total).toBeGreaterThan(0);
    expect(page.items.every((p) => p.is_outlet)).toBe(true);
  });

  it('todo producto outlet de los mocks tiene el daño descripto', () => {
    filterProducts(MOCK_PRODUCTS, { outlet: 'true' }).forEach((p) => expect(p.damage_note.length).toBeGreaterThan(10));
  });

  it('productView expone isOutlet y damageNote', () => {
    const view = productView(MOCK_PRODUCTS.find((p) => p.slug === 'gengar-005-fossil-outlet'));
    expect(view.isOutlet).toBe(true);
    expect(view.damageNote).toMatch(/Rayón/);
  });

  it('la card muestra OUTLET en lugar de REBAJADO', () => {
    render(<ProductCard product={MOCK_PRODUCTS.find((p) => p.slug === 'gengar-005-fossil-outlet')} />);
    expect(screen.getByText('Outlet')).toHaveClass('badge-box--outlet');
    expect(screen.queryByText('Rebajado')).not.toBeInTheDocument();
  });

  it('la ficha muestra el detalle del daño (o un texto por defecto si falta)', () => {
    const { rerender } = render(<DamageNote note="Doblez en la esquina." />);
    expect(screen.getByText('Doblez en la esquina.')).toBeInTheDocument();
    rerender(<DamageNote note="" />);
    expect(screen.getByText(/te mandamos fotos/)).toBeInTheDocument();
  });
});
