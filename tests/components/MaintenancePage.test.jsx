import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import MaintenancePage from '@/components/layout/MaintenancePage';

describe('<MaintenancePage />', () => {
  it('muestra el mensaje del admin y los contactos', () => {
    render(<MaintenancePage message="Cargando stock nuevo." />);
    expect(screen.getByRole('heading', { name: 'Volvemos pronto' })).toBeInTheDocument();
    expect(screen.getByText('Cargando stock nuevo.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument();
  });

  it('sin mensaje usa uno corto por defecto', () => {
    render(<MaintenancePage />);
    expect(screen.getByText('Estamos haciendo unos ajustes. Volvemos pronto.')).toBeInTheDocument();
  });
});
