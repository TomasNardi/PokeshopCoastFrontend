import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { handlers, resetReceived } from './handlers';

export const server = setupServer(...handlers);

/** Llamar al principio de cada archivo de contrato. */
export function useMswServer() {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    resetReceived();
  });
  afterAll(() => server.close());
}
