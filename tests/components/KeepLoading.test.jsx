import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const { default: KeepLoading } = await import('@/components/ui/KeepLoading');
const { ProductGridSkeleton } = await import('@/components/product/ProductSkeletons');

describe('<KeepLoading />', () => {
  it('muestra el esqueleto y reintenta solo, cada vez más espaciado', () => {
    vi.useFakeTimers();
    const reset = vi.fn();
    render(<KeepLoading reset={reset}><p>esqueleto</p></KeepLoading>);
    expect(screen.getByText('esqueleto')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(3000));
    expect(reset).toHaveBeenCalledTimes(1); // el segundo espera 4 s
    act(() => vi.advanceTimersByTime(1000));
    expect(reset).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('pasados 10 s sin suerte avisa que tarda, con un botón para reintentar ya', () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 120000); // racha nueva
    const reset = vi.fn();
    render(<KeepLoading reset={reset}><p>esqueleto</p></KeepLoading>);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByText(/tardando más de lo normal/)).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByText(/tardando más de lo normal/)).toBeInTheDocument();
    const before = reset.mock.calls.length;
    act(() => screen.getByRole('button', { name: 'Reintentar' }).click());
    expect(reset).toHaveBeenCalledTimes(before + 1);
    vi.useRealTimers();
  });

  it('con un esqueleto adentro, la página se ve cargando (nunca rota)', () => {
    render(<KeepLoading><ProductGridSkeleton /></KeepLoading>);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });
});
