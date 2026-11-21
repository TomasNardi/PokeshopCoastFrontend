import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaymentPrices from '@/components/product/PaymentPrices';
import { PaymentSelector } from '@/components/checkout/CheckoutSections';
import { computeTotals } from '@/domain/cart';
import { enabledPaymentMethods } from '@/services/payments/paymentMethods';

const config = { card_surcharge_enabled: true, card_surcharge_percent: 10, mercadopago_enabled: true, transfer_enabled: true };

describe('<PaymentPrices /> (detalle del producto, como Crack)', () => {
  it('precio por transferencia y precio con Mercado Pago con el % del backoffice', () => {
    render(<PaymentPrices price={100000} inStock config={config} />);
    expect(screen.getByText('$100.000')).toBeInTheDocument();
    expect(screen.getByText('Por transferencia bancaria')).toBeInTheDocument();
    expect(screen.getByText('$110.000')).toBeInTheDocument();
    expect(screen.getByText('con Mercado Pago o tarjeta')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });

  it('recargo apagado: solo el precio', () => {
    render(<PaymentPrices price={100000} inStock config={{ ...config, card_surcharge_enabled: false }} />);
    expect(screen.getByText('$100.000')).toBeInTheDocument();
    expect(screen.queryByText('Por transferencia bancaria')).not.toBeInTheDocument();
    expect(screen.queryByText(/Mercado Pago/)).not.toBeInTheDocument();
  });

  it('sin stock no muestra el precio con tarjeta (igual que Crack)', () => {
    render(<PaymentPrices price={100000} inStock={false} config={config} />);
    expect(screen.queryByText('$110.000')).not.toBeInTheDocument();
  });

  it('con un solo medio activo no hay comparación', () => {
    render(<PaymentPrices price={100000} inStock config={{ ...config, transfer_enabled: false }} />);
    expect(screen.queryByText('Por transferencia bancaria')).not.toBeInTheDocument();
  });

  it('sin config (API caída) la página igual muestra el precio', () => {
    render(<PaymentPrices price={100000} inStock config={null} />);
    expect(screen.getByText('$100.000')).toBeInTheDocument();
  });
});

describe('<PaymentSelector /> (checkout, como Crack)', () => {
  const renderSelector = (payment_method, cfg = config) => {
    const totals = computeTotals({ subtotal: 50000, shipping: 8000, surchargePercent: payment_method === 'mercadopago' ? 10 : 0, cardSurchargePercent: 10 });
    return render(
      <PaymentSelector
        form={{ payment_method }}
        errors={{}}
        config={cfg}
        methods={enabledPaymentMethods(cfg)}
        totals={totals}
        setField={() => {}}
        receiptFile={null}
        setReceiptFile={() => {}}
      />,
    );
  };

  it('MP muestra el recargo y transferencia lo que te ahorrás (sin contar el envío)', () => {
    renderSelector('mercadopago');
    expect(screen.getByText('+10% recargo')).toBeInTheDocument();
    expect(screen.getByText('Suma $5.000 a los productos')).toBeInTheDocument();
    expect(screen.getByText('Sin recargo')).toBeInTheDocument();
    expect(screen.getByText('Ahorrás $5.000')).toBeInTheDocument();
  });

  it('oculta el medio que el dueño apagó', () => {
    renderSelector('mercadopago', { ...config, transfer_enabled: false });
    expect(screen.queryByText('Transferencia bancaria')).not.toBeInTheDocument();
    expect(screen.getByText('Mercado Pago')).toBeInTheDocument();
  });
});
