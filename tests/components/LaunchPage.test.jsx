import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const subscribe = vi.fn();
vi.mock('@/services/container', () => ({ getServices: () => ({ engagement: { subscribe } }) }));

const { default: LaunchPage } = await import('@/components/launch/LaunchPage');

const LAUNCH = Date.parse('2026-12-01T00:00:00-03:00');
// 3 días, 4 horas, 5 minutos y 6 segundos antes.
const NOW = LAUNCH - ((3 * 24 + 4) * 3600 + 5 * 60 + 6) * 1000;

afterEach(() => {
  vi.useRealTimers();
  subscribe.mockReset();
});

describe('<LaunchPage />', () => {
  it('anuncia la apertura y muestra la cuenta regresiva', () => {
    vi.useFakeTimers({ now: NOW });
    render(<LaunchPage launchAt={LAUNCH} serverNow={NOW} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('La tienda abre el 1 de diciembre');
    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-label', 'Faltan 3 días, 4 horas y 5 minutos');
    expect([...timer.querySelectorAll('.launch-countdown__digits')].map((d) => d.textContent)).toEqual(['03', '04', '05', '06']);
  });

  it('el reloj avanza cada segundo', () => {
    vi.useFakeTimers({ now: NOW });
    const { container } = render(<LaunchPage launchAt={LAUNCH} serverNow={NOW} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(container.querySelectorAll('.launch-countdown__digits')[3]).toHaveTextContent('04');
  });

  it('al llegar a cero dice "¡Abrimos!" y recarga para entrar a la tienda', () => {
    vi.useFakeTimers({ now: LAUNCH - 1000 });
    const reload = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload });
    render(<LaunchPage launchAt={LAUNCH} serverNow={LAUNCH - 1000} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('status')).toHaveTextContent('¡Abrimos!');
    act(() => vi.advanceTimersByTime(2000));
    expect(reload).toHaveBeenCalled();
  });

  it('"Avisame cuando abra" suscribe con source lanzamiento y confirma en la misma línea', async () => {
    subscribe.mockResolvedValue({ message: 'ok' });
    render(<LaunchPage launchAt={LAUNCH} serverNow={NOW} />);
    fireEvent.change(screen.getByLabelText('Avisame cuando abra'), { target: { value: 'ash@kanto.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Avisame' }));
    await waitFor(() => expect(screen.getByText(/Te escribimos el 1 de diciembre/)).toBeInTheDocument());
    expect(subscribe).toHaveBeenCalledWith('ash@kanto.com', { source: 'lanzamiento' });
  });

  it('un error al suscribir se muestra sin perder el email', async () => {
    subscribe.mockRejectedValue(new Error('Ingresá un email válido.'));
    render(<LaunchPage launchAt={LAUNCH} serverNow={NOW} />);
    const input = screen.getByLabelText('Avisame cuando abra');
    fireEvent.change(input, { target: { value: 'mal' } });
    fireEvent.click(screen.getByRole('button', { name: 'Avisame' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Ingresá un email válido.'));
    expect(input).toHaveValue('mal');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('tiene el acceso desarrollo y las redes', () => {
    render(<LaunchPage launchAt={LAUNCH} serverNow={NOW} />);
    expect(screen.getByRole('button', { name: 'Acceso desarrollo' })).toBeInTheDocument();
    for (const name of ['Instagram', 'TikTok', 'WhatsApp']) {
      expect(screen.getAllByRole('link', { name })[0]).toHaveAttribute('target', '_blank');
    }
  });
});
