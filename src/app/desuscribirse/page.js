import { Suspense } from 'react';
import UnsubscribeResult, { UnsubscribeSkeleton } from '@/components/engagement/UnsubscribeResult';

export const metadata = { title: 'Dejar de recibir mails', robots: { index: false } };

/** El botón "No quiero recibir más mails" de los correos trae acá con `?token=…`. */
export default function Page() {
  return (
    <Suspense fallback={<UnsubscribeSkeleton />}>
      <UnsubscribeResult />
    </Suspense>
  );
}
