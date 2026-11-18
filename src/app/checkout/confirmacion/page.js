import { Suspense } from 'react';
import CheckoutResult from '@/components/checkout/CheckoutResult';
import { CheckoutResultSkeleton } from '@/components/checkout/CheckoutResult';

export const metadata = { title: 'Compra confirmada', robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<CheckoutResultSkeleton />}>
      <CheckoutResult variant="success" />
    </Suspense>
  );
}
