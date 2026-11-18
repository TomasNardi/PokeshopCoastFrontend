import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MaintenancePage, { DEFAULT_MESSAGE, DEFAULT_TITLE } from '@/components/layout/MaintenancePage';

describe('<MaintenancePage />', () => {
  it('muestra título y subtítulo del admin, y los contactos', () => {
    render(<MaintenancePage title="Sitio en desarrollo" message="Cargando stock nuevo." />);
    expect(screen.getByRole('heading', { name: 'Sitio en desarrollo' })).toBeInTheDocument();
    expect(screen.getByText('Cargando stock nuevo.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument();
  });

  it('sin datos del admin usa los textos por defecto', () => {
    render(<MaintenancePage />);
    expect(screen.getByRole('heading', { name: DEFAULT_TITLE })).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_MESSAGE)).toBeInTheDocument();
  });
});

describe('acceso desarrollo', () => {
  it('el botón abre el login y un error de credenciales se muestra', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
    render(<MaintenancePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Acceso desarrollo' }));
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'martin' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'mal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.'));
    expect(globalThis.fetch).toHaveBeenCalledWith('/acceso-desarrollo', expect.objectContaining({ method: 'POST' }));
  });
});
