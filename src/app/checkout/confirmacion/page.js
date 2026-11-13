import { Suspense } from 'react';
import CheckoutResult from '@/components/checkout/CheckoutResult';

export const metadata = { title: 'Compra confirmada', robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <CheckoutResult variant="success" />
    </Suspense>
  );
}
