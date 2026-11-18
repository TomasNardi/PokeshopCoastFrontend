'use client';
import { Lock } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { useHydrated } from '@/hooks/useHydrated';
import { useCheckout } from './useCheckout';
import { CustomerFields, OrderSummary, PaymentSelector, ShippingSelector, Step } from './CheckoutSections';
import Button from '@/components/ui/Button';
import { CheckoutSkeleton } from '@/components/cart/CartSkeletons';

export default function CheckoutForm() {
  const hydrated = useHydrated();
  const checkout = useCheckout();
  const { items, form, errors, config, totals, discount, submitting } = checkout;

  if (!hydrated) return <CheckoutSkeleton />;
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-coast-gray">Tu carrito está vacío.</p>
        <Button href="/tienda" className="mt-6">Ir a la tienda</Button>
      </div>
    );
  }

  const blocked = items.some((i) => i.in_stock === false);
  const payLabel = form.payment_method === 'mercadopago' ? 'Pagar con Mercado Pago' : 'Confirmar pedido';

  return (
    <form onSubmit={checkout.submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <Step number={1} title="Tus datos">
          <CustomerFields form={form} errors={errors} setField={checkout.setField} />
        </Step>
        <Step number={2} title="Envío">
          <ShippingSelector form={form} errors={errors} config={config} setField={checkout.setField} setShipping={checkout.setShipping} />
        </Step>
        <Step number={3} title="Pago">
          <PaymentSelector
            form={form}
            errors={errors}
            config={config}
            setField={checkout.setField}
            receiptFile={checkout.receiptFile}
            setReceiptFile={checkout.setReceiptFile}
          />
        </Step>
      </div>

      <OrderSummary items={items} totals={totals} discount={discount} onRedeem={checkout.redeem}>
        {blocked && <p className="mt-4 text-[12px] text-coast-red-dark">Hay productos sin stock en tu carrito. Quitalos para continuar.</p>}
        <button type="submit" disabled={submitting || blocked} className={buttonClass({ size: 'lg', block: true, className: 'mt-6' })}>
          <Lock size={14} />
          {submitting ? 'Procesando…' : payLabel}
        </button>
        <p className="mt-3 text-center text-[11px] text-coast-mist">El total final lo confirma el sistema al crear el pedido.</p>
      </OrderSummary>
    </form>
  );
}
