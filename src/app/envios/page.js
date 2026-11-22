import { CreditCard, Package, Truck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import PickupMap from '@/components/shipping/PickupMap';
import { SHIPPING_METHOD_LIST } from '@/services/shipping/shippingMethods';
import { PAYMENT_METHOD_LIST } from '@/services/payments/paymentMethods';

export const metadata = { title: 'Envíos y pagos', description: 'Envíos a todo el país con Correo Argentino y Andreani, retiro en persona y pagos con Mercado Pago.' };

export default function EnviosPage() {
  return (
    <>
      <PageHeader eyebrow="Envíos y pagos" title="Llega a todo el país">
        Cada carta viaja en sleeve + toploader, dentro de un sobre rígido. Los sellados van con caja y protección.
      </PageHeader>
      <div className="container-site space-y-14">
        <section>
          <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-extrabold"><Truck className="text-coast-red" /> Formas de envío</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {SHIPPING_METHOD_LIST.map((m) => (
              <article key={m.id} className="rounded-2xl border border-coast-line bg-white p-6">
                <h3 className="font-bold">{m.label}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-coast-gray">{m.description}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-coast-gray">Trabajamos con Correo Argentino y Andreani. El costo exacto y la demora se calculan en el checkout con tu código postal.</p>
        </section>
        <section>
          <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-extrabold"><CreditCard className="text-coast-red" /> Medios de pago</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PAYMENT_METHOD_LIST.map((m) => (
              <article key={m.id} className="rounded-2xl border border-coast-line bg-white p-6">
                <h3 className="font-bold">{m.label}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-coast-gray">{m.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-extrabold"><Package className="text-coast-red" /> Retiro en persona</h2>
          <p className="mb-4 max-w-2xl text-[14px] leading-relaxed text-coast-gray">
            Sin costo, en Santa Clara del Mar. Elegí «Retiro en persona» en el checkout y coordinamos día y horario por WhatsApp.
          </p>
          <PickupMap className="max-w-2xl" />
        </section>
        <section className="rounded-2xl bg-coast-cream-deep p-8">
          <h2 className="flex items-center gap-3 font-display text-2xl font-extrabold"><Package className="text-coast-red" /> Seguimiento</h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-coast-gray">
            Cuando despachamos tu pedido te llega un email con el código de seguimiento. Si tenés cuenta, también lo ves en Mi cuenta → Pedidos.
          </p>
        </section>
      </div>
    </>
  );
}
