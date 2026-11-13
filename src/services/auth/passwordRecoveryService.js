import { AuthError, isRateLimit, toAuthError } from './authErrors';
import { AUTH_ROUTES } from './authService';
import { evaluatePassword, exceedsMax, isValidEmail, isValidPassword } from '@/domain/passwordRules';

export const RECOVERY_SENT_MESSAGE =
  'Si existe una cuenta con ese email, te mandamos un link para crear una contraseña nueva. Revisá tu casilla (y el spam).';

const browserOrigin = () => (typeof window !== 'undefined' ? window.location.origin : '');

/**
 * Servicio de recuperación de contraseña.
 *
 * Flujo:
 *  1. /cuenta/recuperar → requestReset(email): el proveedor (Supabase) manda
 *     el mail vía SMTP de Resend con un link a /cuenta/restablecer.
 *  2. El link abre sesión temporal (evento PASSWORD_RECOVERY).
 *  3. /cuenta/restablecer → resetPassword(nueva, confirmación).
 *
 * Seguridad: requestReset responde SIEMPRE lo mismo exista o no la cuenta
 * (no permite enumerar emails). Solo se distingue el rate limit.
 */
export function createPasswordRecoveryService(provider, { origin = browserOrigin } = {}) {
  return {
    async requestReset(email) {
      const clean = String(email || '').trim().toLowerCase();
      if (!isValidEmail(clean)) throw new AuthError('Ingresá un email válido.', { code: 'invalid_email' });
      try {
        await provider.requestPasswordReset({ email: clean, redirectTo: origin() + AUTH_ROUTES.reset });
      } catch (error) {
        if (isRateLimit(error)) throw toAuthError(error);
        // Cualquier otro error (incluido "usuario no existe") se calla a propósito.
      }
      return { message: RECOVERY_SENT_MESSAGE };
    },

    /** Checklist de reglas para pintar en vivo. */
    evaluate: (password) => evaluatePassword(password),

    async resetPassword(password, confirmation) {
      if (exceedsMax(password)) throw new AuthError('La contraseña es demasiado larga.', { code: 'too_long' });
      if (!isValidPassword(password)) throw new AuthError('La contraseña no cumple los requisitos.', { code: 'weak_password' });
      if (password !== confirmation) throw new AuthError('Las contraseñas no coinciden.', { code: 'mismatch' });
      try {
        await provider.updatePassword(password);
      } catch (error) {
        throw toAuthError(error, 'No pudimos cambiar la contraseña. Pedí un link nuevo.');
      }
      return { message: 'Listo, tu contraseña quedó actualizada.' };
    },
  };
}
