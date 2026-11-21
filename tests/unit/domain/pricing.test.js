import { describe, expect, it } from 'vitest';
import { cardPriceOf, cardSurchargePercent, isPaymentEnabled, surchargeOn } from '@/domain/pricing';
import { enabledPaymentMethods } from '@/services/payments/paymentMethods';

const on = (percent) => ({ card_surcharge_enabled: true, card_surcharge_percent: percent });

describe('cardSurchargePercent (config del backoffice)', () => {
  it('usa el % cuando el recargo está activo', () => {
    expect(cardSurchargePercent(on(10))).toBe(10);
    expect(cardSurchargePercent(on('12.5'))).toBe(12.5);
  });
  it('0 si está apagado, vacío o sin config', () => {
    expect(cardSurchargePercent({ card_surcharge_enabled: false, card_surcharge_percent: 10 })).toBe(0);
    expect(cardSurchargePercent(on(0))).toBe(0);
    expect(cardSurchargePercent(on('abc'))).toBe(0);
    expect(cardSurchargePercent(null)).toBe(0);
  });
});

describe('cardPriceOf', () => {
  it('precio por transferencia + recargo, redondeado a pesos', () => {
    expect(cardPriceOf(10000, on(10))).toBe(11000);
    expect(cardPriceOf('15999', on(10))).toBe(17599);
  });
  it('null si no hay recargo: no hay diferencia que mostrar', () => {
    expect(cardPriceOf(10000, on(0))).toBeNull();
    expect(cardPriceOf(10000, null)).toBeNull();
    expect(cardPriceOf(0, on(10))).toBeNull();
  });
});

describe('surchargeOn', () => {
  it('0 sin monto o sin %', () => {
    expect(surchargeOn(0, 10)).toBe(0);
    expect(surchargeOn(1000, 0)).toBe(0);
  });
});

describe('medios activos en el backoffice', () => {
  it('sin config muestra los dos', () => {
    expect(enabledPaymentMethods(null).map((m) => m.id)).toEqual(['mercadopago', 'transfer']);
  });
  it('oculta el que el dueño apagó', () => {
    expect(enabledPaymentMethods({ transfer_enabled: false, mercadopago_enabled: true }).map((m) => m.id)).toEqual(['mercadopago']);
    expect(enabledPaymentMethods({ transfer_enabled: true, mercadopago_enabled: false }).map((m) => m.id)).toEqual(['transfer']);
    expect(isPaymentEnabled('transfer', {})).toBe(true);
  });
});
