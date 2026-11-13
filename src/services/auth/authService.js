import { toAuthError } from './authErrors';
import { isValidEmail, isValidPassword } from '@/domain/passwordRules';

export const AUTH_ROUTES = Object.freeze({
  login: '/cuenta/ingresar',
  account: '/cuenta',
  recover: '/cuenta/recuperar',
  reset: '/cuenta/restablecer',
});

const browserOrigin = () => (typeof window !== 'undefined' ? window.location.origin : '');

/**
 * Facade de autenticación (login con Google SSO, email/contraseña, registro,
 * logout). La UI habla solo con esto: no sabe que atrás hay Supabase.
 * Todos los errores salen como AuthError con mensaje en castellano.
 *
 * @param {object} provider AuthProvider (ver supabaseAuthProvider.js)
 * @param {{ origin?: () => string }} [options]
 */
export function createAuthService(provider, { origin = browserOrigin } = {}) {
  const guard = async (fn, fallback) => {
    try {
      return await fn();
    } catch (error) {
      throw toAuthError(error, fallback);
    }
  };

  /** Solo rutas internas: un `next=https://evil.com` no puede sacar al usuario del sitio. */
  const safePath = (path) => (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : AUTH_ROUTES.account);

  return {
    get enabled() {
      return provider.enabled;
    },
    getSession: () => provider.getSession().catch(() => null),
    getAccessToken: async () => (await provider.getSession().catch(() => null))?.accessToken ?? null,
    onChange: (callback) => provider.onChange(callback),

    signInWithGoogle: (returnTo) =>
      guard(() => provider.signInWithGoogle({ redirectTo: origin() + safePath(returnTo) }), 'No pudimos conectar con Google.'),

    signInWithPassword: ({ email, password }) =>
      guard(async () => {
        if (!isValidEmail(email)) throw Object.assign(new Error(''), { code: 'invalid_credentials' });
        return provider.signInWithPassword({ email: email.trim().toLowerCase(), password });
      }, 'No pudimos ingresar.'),

    signUp: ({ email, password }) =>
      guard(async () => {
        if (!isValidEmail(email)) throw new Error('Ingresá un email válido.');
        if (!isValidPassword(password)) throw Object.assign(new Error(''), { code: 'weak_password' });
        return provider.signUp({ email: email.trim().toLowerCase(), password, redirectTo: origin() + AUTH_ROUTES.account });
      }, 'No pudimos crear la cuenta.'),

    resendConfirmation: (email) =>
      guard(() => provider.resendConfirmation({ email, redirectTo: origin() + AUTH_ROUTES.account })),

    signOut: () => guard(() => provider.signOut()),
    safePath,
  };
}
