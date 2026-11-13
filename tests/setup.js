import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { router } from './helpers/router';

afterEach(() => {
  cleanup();
  localStorage.clear();
  Object.values(router).forEach((fn) => fn.mockClear());
});

// next/navigation no existe fuera del runtime de Next. Los tests inspeccionan
// el router con `import { router } from 'tests/helpers/router'`.
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));
