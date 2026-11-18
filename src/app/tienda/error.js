'use client';
import KeepLoading from '@/components/ui/KeepLoading';
import TiendaLoading from './loading';

/** Si la tienda falla, queda su esqueleto y se reintenta sola. */
export default function TiendaError({ reset }) {
  return (
    <KeepLoading reset={reset}>
      <TiendaLoading />
    </KeepLoading>
  );
}
