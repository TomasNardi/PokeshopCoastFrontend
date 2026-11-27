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

/**
 * Constancias de pedidos hechos como invitado EN ESTE NAVEGADOR (firmadas por
 * el backend). Al entrar con cualquier cuenta se mandan y esos pedidos pasan a
 * "Mi cuenta", aunque haya comprado con otro mail (ej. Hotmail y entra con Google).
 * localStorage: sobrevive a cerrar el navegador; el backend las acepta 30 días.
 */
const CLAIMS_KEY = 'pokeshop:order-claims';
const MAX_CLAIMS = 20;

export function rememberOrderClaim(token) {
  if (!token) return;
  try {
    const list = readOrderClaims().filter((t) => t !== token);
    list.push(token);
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(list.slice(-MAX_CLAIMS)));
  } catch {
    /* sin storage: queda el camino del mismo mail verificado */
  }
}

export function readOrderClaims() {
  try {
    const list = JSON.parse(localStorage.getItem(CLAIMS_KEY) || '[]');
    return Array.isArray(list) ? list.filter((t) => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

export function forgetOrderClaims() {
  try {
    localStorage.removeItem(CLAIMS_KEY);
  } catch {
    /* nada */
  }
}

/** ¿Hay compras de invitado de este navegador esperando una cuenta? */
export const hasPendingOrderClaims = () => readOrderClaims().length > 0;

/** Aviso al entrar cuando el backend sumó pedidos de invitado a la cuenta. */
export function linkedOrdersMessage(codes) {
  const list = Array.isArray(codes) ? codes.filter(Boolean) : [];
  if (list.length === 0) return '';
  if (list.length === 1) return `Sumamos tu pedido ${list[0]} a tu cuenta.`;
  return `Sumamos ${list.length} pedidos a tu cuenta.`;
}
