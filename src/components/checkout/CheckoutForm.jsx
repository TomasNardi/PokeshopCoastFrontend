'use client';
import { Lock } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { useHydrated } from '@/hooks/useHydrated';
import { useCheckout } from './useCheckout';
import { formatPrice } from '@/domain/money';
import { CustomerFields, MobileSummary, OrderSummary, PaymentSelector, Step } from './CheckoutSections';
import ShippingStep from './ShippingStep';
import Button from '@/components/ui/Button';
import { CheckoutSkeleton } from '@/components/cart/CartSkeletons';
import TransferStep from './TransferStep';

export default function CheckoutForm() {
  const hydrated = useHydrated();
  const checkout = useCheckout();
  const { items, form, errors, config, paymentMethods, totals, discount, submitting } = checkout;

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
    <form onSubmit={checkout.submit} noValidate className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
      <div className="min-w-0 space-y-4 sm:space-y-6">
        <MobileSummary items={items} totals={totals} discount={discount} paymentMethod={form.payment_method} />
        <Step number={1} title="Tus datos" delay={0.05}>
          <CustomerFields form={form} errors={errors} setField={checkout.setField} guest={checkout.guest} />
        </Step>
        <Step number={2} title="Envío" delay={0.1}>
          <ShippingStep form={form} errors={errors} setField={checkout.setField} shipping={checkout.shipping} freeShipping={totals.freeShipping} loggedIn={checkout.loggedIn} />
        </Step>
        <Step number={3} title="Pago" delay={0.15}>
          <PaymentSelector
            form={form}
            errors={errors}
            config={config}
            methods={paymentMethods}
            totals={totals}
            setField={checkout.setField}
          />
        </Step>
      </div>

      <OrderSummary items={items} totals={totals} discount={discount} paymentMethod={form.payment_method} onRedeem={checkout.redeem} onRemoveDiscount={checkout.removeDiscount}>
        {blocked && <p className="mt-4 text-[12px] text-coast-red-dark">Hay productos sin stock en tu carrito. Quitalos para continuar.</p>}
        <button type="submit" disabled={submitting || blocked} className={buttonClass({ size: 'lg', block: true, className: 'mt-6 !hidden lg:!inline-flex' })}>
          <Lock size={14} />
          {submitting ? 'Procesando…' : payLabel}
        </button>
        <p className="mt-3 text-center text-[11px] text-uns-muted">El total final lo confirma el sistema al crear el pedido.</p>
      </OrderSummary>

      {/* Mobile: el total y el botón de pagar siempre a mano, pegados abajo. */}
      <div className="checkout-paybar lg:hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-uns-muted">Total</p>
          <p className="whitespace-nowrap text-[18px] font-bold leading-tight">{formatPrice(totals.total)}</p>
        </div>
        <button type="submit" disabled={submitting || blocked} className={buttonClass({ className: 'flex-1 !px-4' })}>
          <Lock size={14} />
          {submitting ? 'Procesando…' : form.payment_method === 'mercadopago' ? 'Pagar' : 'Confirmar'}
        </button>
      </div>

      {form.payment_method === 'transfer' && (
        <TransferStep
          open={checkout.transferOpen}
          total={totals.total}
          transfer={config?.transfer}
          receipt={checkout.receipt}
          onPickReceipt={checkout.pickReceipt}
          submitting={submitting}
          onConfirm={() => checkout.submit()}
          onBack={checkout.closeTransfer}
        />
      )}
    </form>
  );
}
