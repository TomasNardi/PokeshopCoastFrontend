import { formatPrice } from '@/domain/money';
import { cardPriceOf, cardSurchargePercent, isPaymentEnabled } from '@/domain/pricing';

/**
 * Precio del detalle de producto, igual que Crack: el publicado es el precio
 * por transferencia y, abajo, el precio con Mercado Pago / tarjeta con el
 * recargo del backoffice. Server component: la config llega con la página.
 *
 * Sin recargo (apagado o 0%), o con un solo medio de pago activo, no hay
 * diferencia que mostrar: queda solo el precio.
 */
export default function PaymentPrices({ price, compareAtPrice, hasDiscount, inStock, config }) {
  const percent = cardSurchargePercent(config);
  const bothMethods = isPaymentEnabled('transfer', config) && isPaymentEnabled('mercadopago', config);
  const cardPrice = bothMethods ? cardPriceOf(price, config) : null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`text-3xl font-bold ${hasDiscount ? 'text-coast-red' : ''}`}>{formatPrice(price)}</span>
        {compareAtPrice && <span className="text-lg text-coast-mist line-through">{formatPrice(compareAtPrice)}</span>}
      </div>
      {cardPrice && (
        <p className="mt-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-uns-muted">Por transferencia bancaria</p>
      )}

      {cardPrice && inStock && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-uns-hairline pt-3 text-[13px] text-uns-muted">
          <span className="text-[15px] font-bold text-black">{formatPrice(cardPrice)}</span>
          <span>con Mercado Pago o tarjeta</span>
          <span className="badge-box border border-black bg-white text-black">+{percent}%</span>
        </p>
      )}
    </div>
  );
}
