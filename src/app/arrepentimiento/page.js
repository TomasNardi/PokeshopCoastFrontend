import { Suspense } from 'react';
import { CalendarClock, PackageOpen, Wallet } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import WithdrawalForm from '@/components/withdrawal/WithdrawalForm';
import { CONTACT } from '@/config/site';

export const metadata = {
  title: 'Botón de arrepentimiento',
  description: 'Revocá tu compra dentro de los 10 días corridos desde que la recibiste, sin costo y sin registrarte.',
};

const RIGHTS = [
  { icon: CalendarClock, title: '10 días corridos', text: 'Tenés 10 días corridos desde que recibiste el producto para arrepentirte de la compra.' },
  { icon: PackageOpen, title: 'Sin costo', text: 'La devolución no tiene costo para vos. El producto tiene que estar en el mismo estado en que lo recibiste.' },
  { icon: Wallet, title: 'Reintegro total', text: 'Te devolvemos el dinero por el mismo medio de pago que usaste.' },
];

export default function ArrepentimientoPage() {
  return (
    <>
      <PageHeader eyebrow="Defensa del consumidor" title="Botón de arrepentimiento">
        Completá el formulario y te damos un código de trámite en el momento. No hace falta tener cuenta.
      </PageHeader>
      <div className="container-site grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
        <div className="rounded-2xl border border-coast-line bg-white p-6 sm:p-10">
          <Suspense fallback={null}>
            <WithdrawalForm />
          </Suspense>
        </div>
        <aside className="space-y-6">
          <ul className="space-y-5">
            {RIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coast-red-soft text-coast-red">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-[13px] font-bold uppercase tracking-[0.06em]">{title}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-coast-gray">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-coast-line pt-5 text-[12px] leading-relaxed text-coast-mist">
            Ley 24.240 de Defensa del Consumidor (art. 34), Código Civil y Comercial (arts. 1110 a 1116) y Resolución
            424/2020 de la Secretaría de Comercio Interior. ¿Dudas? Escribinos a{' '}
            <a href={`mailto:${CONTACT.email}`} className="font-semibold text-coast-ink underline underline-offset-4">{CONTACT.email}</a>.
          </p>
        </aside>
      </div>
    </>
  );
}
