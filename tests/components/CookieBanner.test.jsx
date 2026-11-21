import { describe, expect, it, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import CookieBanner, { CONSENT_KEY } from '@/components/layout/CookieBanner';

describe('aviso de cookies', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  it('aparece la primera vez y "Aceptar" lo guarda y avisa', () => {
    const heard = vi.fn();
    window.addEventListener('psc:cookie-consent', heard);
    render(<CookieBanner />);
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getAllByText(/Usamos cookies/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Aceptar'));
    expect(window.localStorage.getItem(CONSENT_KEY)).toBe('accepted');
    expect(heard).toHaveBeenCalled();
    expect(screen.queryAllByText(/Usamos cookies/)).toHaveLength(0);
  });

  it('si ya decidió, no vuelve a aparecer', () => {
    window.localStorage.setItem(CONSENT_KEY, 'dismissed');
    render(<CookieBanner />);
    act(() => vi.advanceTimersByTime(900));
    expect(screen.queryAllByText(/Usamos cookies/)).toHaveLength(0);
  });
});
