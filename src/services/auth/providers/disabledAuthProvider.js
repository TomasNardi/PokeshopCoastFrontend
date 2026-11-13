/**
 * Null Object: sin Supabase configurado las cuentas se apagan y el sitio vende
 * igual (compra como invitado). Evita `if (auth)` desperdigados por la UI.
 */
const unavailable = async () => {
  throw Object.assign(new Error('Las cuentas no están disponibles por ahora.'), { code: 'provider_disabled' });
};

export function createDisabledAuthProvider() {
  return {
    enabled: false,
    getSession: async () => null,
    onChange(callback) {
      queueMicrotask(() => callback('INITIAL_SESSION', null));
      return () => {};
    },
    signInWithGoogle: unavailable,
    signInWithPassword: unavailable,
    signUp: unavailable,
    signOut: async () => {},
    requestPasswordReset: unavailable,
    updatePassword: unavailable,
    resendConfirmation: unavailable,
  };
}
