'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carga de datos en componentes cliente: { data, error, loading, reload, setData }.
 * Ignora respuestas que llegan después de desmontar o de un reload más nuevo.
 */
export function useAsync(load, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const request = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  const reload = useCallback(async () => {
    const id = ++request.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await run();
      if (id === request.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === request.current) setState((prev) => ({ ...prev, error, loading: false }));
    }
  }, [run]);

  useEffect(() => {
    reload();
    return () => {
      request.current += 1;
    };
  }, [reload]);

  const setData = useCallback((update) => {
    setState((prev) => ({ ...prev, data: typeof update === 'function' ? update(prev.data) : update }));
  }, []);

  return { ...state, reload, setData };
}
