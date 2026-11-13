import { Suspense } from 'react';
import CheckoutResult from '@/components/checkout/CheckoutResult';

export const metadata = { title: 'Pago rechazado', robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <CheckoutResult variant="error" />
    </Suspense>
  );
}
