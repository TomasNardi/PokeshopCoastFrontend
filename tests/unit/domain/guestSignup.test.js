import { beforeEach, describe, expect, it } from 'vitest';
import { SIGNUP_HREF, forgetGuestEmail, readGuestEmail, rememberGuestEmail } from '@/domain/guestSignup';

describe('guestSignup', () => {
  beforeEach(() => sessionStorage.clear());

  it('guarda el email del invitado en la sesión (normalizado) y lo olvida', () => {
    rememberGuestEmail('  Ana@Ejemplo.com ');
    expect(readGuestEmail()).toBe('ana@ejemplo.com');
    forgetGuestEmail();
    expect(readGuestEmail()).toBe('');
  });

  it('el link de registro nunca lleva el email en la URL', () => {
    rememberGuestEmail('ana@ejemplo.com');
    expect(SIGNUP_HREF).not.toMatch(/@|email/);
  });
});

describe('constancias de pedidos de invitado', () => {
  beforeEach(() => localStorage.clear());

  it('se guardan sin repetir, se leen y se olvidan', async () => {
    const { forgetOrderClaims, readOrderClaims, rememberOrderClaim } = await import('@/domain/guestSignup');
    rememberOrderClaim('a');
    rememberOrderClaim('b');
    rememberOrderClaim('a');
    expect(readOrderClaims()).toEqual(['b', 'a']);
    forgetOrderClaims();
    expect(readOrderClaims()).toEqual([]);
  });

  it('ignora vacíos y basura en el storage', async () => {
    const { readOrderClaims, rememberOrderClaim } = await import('@/domain/guestSignup');
    rememberOrderClaim('');
    expect(readOrderClaims()).toEqual([]);
    localStorage.setItem('pokeshop:order-claims', '{no es json');
    expect(readOrderClaims()).toEqual([]);
  });
});

describe('vínculo de compras de invitado', () => {
  beforeEach(() => localStorage.clear());

  it('sabe si hay compras de este navegador esperando una cuenta', async () => {
    const { hasPendingOrderClaims, rememberOrderClaim, forgetOrderClaims } = await import('@/domain/guestSignup');
    expect(hasPendingOrderClaims()).toBe(false);
    rememberOrderClaim('token-1');
    expect(hasPendingOrderClaims()).toBe(true);
    forgetOrderClaims();
    expect(hasPendingOrderClaims()).toBe(false);
  });

  it('arma el aviso con el código, o la cantidad si son varios', async () => {
    const { linkedOrdersMessage } = await import('@/domain/guestSignup');
    expect(linkedOrdersMessage(undefined)).toBe('');
    expect(linkedOrdersMessage([])).toBe('');
    expect(linkedOrdersMessage(['PSC-AB12CD'])).toBe('Sumamos tu pedido PSC-AB12CD a tu cuenta.');
    expect(linkedOrdersMessage(['PSC-1', 'PSC-2'])).toBe('Sumamos 2 pedidos a tu cuenta.');
  });
});
