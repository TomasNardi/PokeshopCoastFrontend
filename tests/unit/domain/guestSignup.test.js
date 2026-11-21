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
