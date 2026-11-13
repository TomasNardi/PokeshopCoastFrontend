/**
 * Traduce errores del proveedor de identidad (Supabase) a castellano de cliente.
 * Se matchea por `code` primero (estable) y por texto como respaldo.
 */
const BY_CODE = {
  invalid_credentials: 'El email o la contraseña no son correctos.',
  email_not_confirmed: 'Todavía no confirmaste tu email. Revisá tu casilla (y el spam).',
  user_already_exists: 'Ya existe una cuenta con ese email. Probá ingresar o recuperar la contraseña.',
  email_exists: 'Ya existe una cuenta con ese email. Probá ingresar o recuperar la contraseña.',
  weak_password: 'La contraseña no cumple los requisitos.',
  same_password: 'La nueva contraseña tiene que ser distinta de la anterior.',
  over_email_send_rate_limit: 'Pediste demasiados emails seguidos. Esperá unos minutos y volvé a intentar.',
  over_request_rate_limit: 'Demasiados intentos seguidos. Esperá unos minutos y volvé a intentar.',
  session_not_found: 'Tu sesión venció. Volvé a ingresar.',
  otp_expired: 'El link venció o ya se usó. Pedí uno nuevo.',
  provider_disabled: 'Ese método de ingreso no está disponible por ahora.',
};

const BY_TEXT = [
  [/invalid login credentials/i, BY_CODE.invalid_credentials],
  [/email not confirmed/i, BY_CODE.email_not_confirmed],
  [/already registered/i, BY_CODE.user_already_exists],
  [/rate limit/i, BY_CODE.over_request_rate_limit],
  [/expired|invalid.*token/i, BY_CODE.otp_expired],
  [/failed to fetch|network/i, 'No pudimos conectarnos. Revisá tu conexión a internet y volvé a intentar.'],
];

export class AuthError extends Error {
  constructor(message, { code = '', cause } = {}) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.cause = cause;
  }
}

export function toAuthError(error, fallback = 'No pudimos completar la operación. Volvé a intentar.') {
  if (error instanceof AuthError) return error;
  const code = error?.code || '';
  if (BY_CODE[code]) return new AuthError(BY_CODE[code], { code, cause: error });
  const text = String(error?.message || '');
  const match = BY_TEXT.find(([re]) => re.test(text));
  return new AuthError(match ? match[1] : fallback, { code, cause: error });
}

export const isRateLimit = (error) => /rate_limit/.test(error?.code || '');
