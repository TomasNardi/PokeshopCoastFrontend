'use client';
import KeepLoading from '@/components/ui/KeepLoading';
import Loading from './loading';

/** Si la página falla, queda su esqueleto y se reintenta sola. */
export default function SegmentError({ reset }) {
  return (
    <KeepLoading reset={reset}>
      <Loading />
    </KeepLoading>
  );
}
