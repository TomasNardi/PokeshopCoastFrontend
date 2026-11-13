/**
 * Reglas de contraseña — única fuente de verdad (port de Delta).
 *
 * Quien manda de verdad es Supabase Auth (Password Requirements). Esto es la
 * cara visible de esa política: si cambiás una regla acá, cambiala allá.
 * Clases Unicode a propósito: "Ñandú" tiene mayúscula, "contraseña" minúsculas.
 */

export const MIN_LENGTH = 8;

/** bcrypt ignora lo que pase de 72 BYTES (no caracteres): ñ y acentos ocupan 2. */
export const MAX_BYTES = 72;

export const byteLength = (password) => new TextEncoder().encode(password).length;
export const exceedsMax = (password) => byteLength(password) > MAX_BYTES;

export const PASSWORD_RULES = [
  { id: 'uppercase', label: 'Letra mayúscula', test: (pw) => /\p{Lu}/u.test(pw) },
  { id: 'lowercase', label: 'Letra minúscula', test: (pw) => /\p{Ll}/u.test(pw) },
  { id: 'number', label: 'Número', test: (pw) => /\p{Nd}/u.test(pw) },
  // Especial = ni letra ni número; el espacio no cuenta.
  { id: 'special', label: 'Carácter especial (ej. !?@#$%)', test: (pw) => /[^\p{L}\p{Nd}\s]/u.test(pw) },
  { id: 'length', label: `${MIN_LENGTH} caracteres o más`, test: (pw) => [...pw].length >= MIN_LENGTH },
];

export const evaluatePassword = (password = '') =>
  PASSWORD_RULES.map(({ id, label, test }) => ({ id, label, ok: test(password) }));

export const failedRules = (password = '') =>
  PASSWORD_RULES.filter(({ test }) => !test(password)).map(({ id }) => id);

export const isValidPassword = (password = '') =>
  failedRules(password).length === 0 && !exceedsMax(password);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (email = '') => EMAIL_RE.test(String(email).trim());
