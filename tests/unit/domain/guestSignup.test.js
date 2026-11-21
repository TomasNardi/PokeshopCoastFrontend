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
