import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/product/ProductCard';

const base = { id: 1, slug: 'charizard', name: 'Charizard', price_ars: '1000', final_price: '1000', stock_quantity: 1, in_stock: true,
  category: { slug: 'singles', name: 'Singles' }, catalog: { name: 'Charizard', number: '4/102', set_name: 'Base Set' } };

describe('ProductCard: etiqueta Holofoil', () => {
  it('se ve en una carta holo', () => {
    render(<ProductCard product={{ ...base, finish: 'Holofoil' }} />);
    expect(screen.getByText('Holofoil')).toBeInTheDocument();
  });
  it('no se ve en una reverse ni en una normal', () => {
    const { rerender } = render(<ProductCard product={{ ...base, finish: 'Reverse Holofoil' }} />);
    expect(screen.queryByText('Holofoil')).toBeNull();
    rerender(<ProductCard product={{ ...base, finish: 'Normal' }} />);
    expect(screen.queryByText('Holofoil')).toBeNull();
  });
});
