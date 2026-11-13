'use client';
import { useEffect, useState } from 'react';

/** false en SSR y en el primer render: evita mismatch con estado persistido (carrito). */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
