/**
 * Decorator: demora cada método async de un repositorio. Solo para revisar
 * esqueletos y estados de carga con mocks (NEXT_PUBLIC_MOCK_LATENCY_MS); con 0
 * devuelve el repositorio tal cual.
 */
export function withLatency(repository, ms) {
  if (!ms || ms <= 0) return repository;
  const wait = () => new Promise((resolve) => setTimeout(resolve, ms));
  return Object.fromEntries(
    Object.entries(repository).map(([name, value]) => [
      name,
      typeof value === 'function'
        ? async (...args) => {
            await wait();
            return value(...args);
          }
        : value,
    ])
  );
}
