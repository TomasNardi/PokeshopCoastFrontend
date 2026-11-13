import { describe, expect, it, vi } from 'vitest';
import { createAuthService } from '@/services/auth/authService';
import { createPasswordRecoveryService, RECOVERY_SENT_MESSAGE } from '@/services/auth/passwordRecoveryService';
import { createMockAuthProvider } from '@/services/auth/providers/mockAuthProvider';
import { createDisabledAuthProvider } from '@/services/auth/providers/disabledAuthProvider';
import { toAuthError } from '@/services/auth/authErrors';

const origin = () => 'https://pokeshopcoast.com';
const setup = () => {
  const provider = createMockAuthProvider({ persist: false });
  return {
    provider,
    auth: createAuthService(provider, { origin }),
    recovery: createPasswordRecoveryService(provider, { origin }),
  };
};

describe('authService (facade)', () => {
  it('Google SSO redirige de vuelta al sitio, a la ruta pedida', async () => {
    const provider = createMockAuthProvider({ persist: false });
    const spy = vi.spyOn(provider, 'signInWithGoogle');
    await createAuthService(provider, { origin }).signInWithGoogle('/checkout');
    expect(spy).toHaveBeenCalledWith({ redirectTo: 'https://pokeshopcoast.com/checkout' });
  });

  it('no permite open redirect con returnTo externo', async () => {
    const provider = createMockAuthProvider({ persist: false });
    const spy = vi.spyOn(provider, 'signInWithGoogle');
    await createAuthService(provider, { origin }).signInWithGoogle('//evil.com');
    expect(spy).toHaveBeenCalledWith({ redirectTo: 'https://pokeshopcoast.com/cuenta' });
  });

  it('login con email: credenciales malas → mensaje en castellano', async () => {
    const { auth } = setup();
    await expect(auth.signInWithPassword({ email: 'demo@pokeshopcoast.com', password: 'mal' })).rejects.toThrow(
      'El email o la contraseña no son correctos.'
    );
  });

  it('login correcto deja token disponible para el backend', async () => {
    const { auth } = setup();
    await auth.signInWithPassword({ email: 'DEMO@pokeshopcoast.com ', password: 'Coast123!' });
    expect(await auth.getAccessToken()).toBe('mock-token-demo@pokeshopcoast.com');
  });

  it('registro rechaza contraseñas débiles antes de llamar al proveedor', async () => {
    const { auth, provider } = setup();
    const spy = vi.spyOn(provider, 'signUp');
    await expect(auth.signUp({ email: 'a@b.com', password: 'debil' })).rejects.toThrow('La contraseña no cumple los requisitos.');
    expect(spy).not.toHaveBeenCalled();
  });

  it('con proveedor apagado (Null Object) no hay sesión ni token', async () => {
    const auth = createAuthService(createDisabledAuthProvider(), { origin });
    expect(auth.enabled).toBe(false);
    expect(await auth.getAccessToken()).toBeNull();
    await expect(auth.signInWithGoogle()).rejects.toThrow('no está disponible');
  });
});

describe('passwordRecoveryService', () => {
  it('pide el reset con redirect a /cuenta/restablecer', async () => {
    const { recovery, provider } = setup();
    const res = await recovery.requestReset(' Demo@PokeshopCoast.com ');
    expect(res.message).toBe(RECOVERY_SENT_MESSAGE);
    expect(provider.sentEmails.at(-1)).toEqual({
      type: 'recovery',
      email: 'demo@pokeshopcoast.com',
      redirectTo: 'https://pokeshopcoast.com/cuenta/restablecer',
    });
  });

  it('responde lo mismo aunque el email no exista (no enumera cuentas)', async () => {
    const { recovery } = setup();
    expect((await recovery.requestReset('nadie@coast.com')).message).toBe(RECOVERY_SENT_MESSAGE);
  });

  it('el rate limit sí se informa', async () => {
    const { recovery, provider } = setup();
    provider.requestPasswordReset = async () => {
      throw Object.assign(new Error('rate'), { code: 'over_email_send_rate_limit' });
    };
    await expect(recovery.requestReset('demo@pokeshopcoast.com')).rejects.toThrow(/demasiados emails/);
  });

  it('email inválido no llega al proveedor', async () => {
    const { recovery, provider } = setup();
    await expect(recovery.requestReset('nope')).rejects.toThrow('Ingresá un email válido.');
    expect(provider.sentEmails).toHaveLength(0);
  });

  it('flujo completo: link del mail → nueva contraseña → login con la nueva', async () => {
    const { recovery, provider, auth } = setup();
    await recovery.requestReset('demo@pokeshopcoast.com');
    provider.simulateRecoveryLink();
    await recovery.resetPassword('NuevaCoast9#', 'NuevaCoast9#');
    await auth.signOut();
    await expect(auth.signInWithPassword({ email: 'demo@pokeshopcoast.com', password: 'NuevaCoast9#' })).resolves.not.toThrow();
  });

  it('valida reglas y coincidencia antes de cambiar', async () => {
    const { recovery } = setup();
    await expect(recovery.resetPassword('corta', 'corta')).rejects.toMatchObject({ code: 'weak_password' });
    await expect(recovery.resetPassword('NuevaCoast9#', 'Otra9#xxxx')).rejects.toMatchObject({ code: 'mismatch' });
  });

  it('sin sesión de recuperación (link vencido) da un mensaje accionable', async () => {
    const { recovery } = setup();
    await expect(recovery.resetPassword('NuevaCoast9#', 'NuevaCoast9#')).rejects.toThrow('Tu sesión venció');
  });
});

describe('toAuthError', () => {
  it('traduce por code y por texto', () => {
    expect(toAuthError({ code: 'email_not_confirmed' }).message).toMatch(/confirmaste/);
    expect(toAuthError(new Error('Invalid login credentials')).message).toMatch(/no son correctos/);
    expect(toAuthError(new Error('???'), 'fallback').message).toBe('fallback');
  });
});
