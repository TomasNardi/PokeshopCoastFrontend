import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import BackForwardRefresh from '@/components/layout/BackForwardRefresh';
import { isBackForwardNavigation } from '@/hooks/useBackForwardRefresh';
import { router } from '../helpers/router';

const mockNavigationType = (type) =>
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue(type ? [{ type }] : []);

afterEach(() => vi.restoreAllMocks());

describe('fix de volver atrás (Vercel / bfcache)', () => {
  it('detecta una carga back_forward', () => {
    expect(isBackForwardNavigation({ getEntriesByType: () => [{ type: 'back_forward' }] })).toBe(true);
    expect(isBackForwardNavigation({ getEntriesByType: () => [{ type: 'navigate' }] })).toBe(false);
    expect(isBackForwardNavigation(undefined)).toBe(false);
  });

  it('carga normal: no refresca', () => {
    mockNavigationType('navigate');
    render(<BackForwardRefresh />);
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it('volver atrás (back_forward): refresca los Server Components', () => {
    mockNavigationType('back_forward');
    render(<BackForwardRefresh />);
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });

  it('restaurada desde el bfcache (pageshow persisted): refresca', () => {
    mockNavigationType('navigate');
    render(<BackForwardRefresh />);
    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });

  it('pageshow normal no refresca, y al desmontar se quita el listener', () => {
    mockNavigationType('navigate');
    const { unmount } = render(<BackForwardRefresh />);
    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: false }));
    unmount();
    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
    expect(router.refresh).not.toHaveBeenCalled();
  });
});
