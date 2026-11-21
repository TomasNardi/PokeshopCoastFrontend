/**
 * Puente invitado → cuenta. Al comprar como invitado guardamos el email en la
 * sesión del navegador (nunca en la URL) para ofrecerle crear la cuenta en la
 * confirmación con el email ya cargado. Al registrarse con ese email verificado,
 * el backend le pasa solo sus compras (claim_guest_orders).
 */
const KEY = 'pokeshop:guest-email';

export function rememberGuestEmail(email) {
  try {
    if (email) sessionStorage.setItem(KEY, String(email).trim().toLowerCase());
  } catch {
    /* modo privado: no pasa nada, se escribe a mano */
  }
}

export function readGuestEmail() {
  try {
    return sessionStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function forgetGuestEmail() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nada */
  }
}

export const SIGNUP_HREF = '/cuenta/ingresar?modo=crear&next=/cuenta/pedidos';
