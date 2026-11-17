/**
 * AuthProvider de desarrollo contra el backend real (sin Supabase).
 *
 * POST /customers/dev-login/ {username, password} devuelve un JWT con la misma
 * forma que uno de Supabase, así que el resto del sistema (X-Customer-Token,
 * perfil, pedidos, notificaciones) funciona igual que en producción.
 * Solo existe con NEXT_PUBLIC_DEV_LOGIN=true y el backend en modo local.
 * Usuario de prueba: tomi / tomi.
 */
const STORAGE_KEY = 'psc-dev-session';

const storage = {
  read() {
    try {
      const session = JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) || 'null');
      return session && session.expiresAt > Date.now() ? session : null;
    } catch {
      return null;
    }
  },
  write(session) {
    try {
      if (session) globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(session));
      else globalThis.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      /* modo privado: la sesión vive solo en memoria */
    }
  },
};

const authError = (code, message) => Object.assign(new Error(message), { code });
const unavailable = () => {
  throw authError('dev_only', 'En modo desarrollo solo funciona el usuario de prueba (tomi / tomi).');
};

/** @param {ReturnType<import('../../http/httpClient').createHttpClient>} http */
export function createDevApiAuthProvider(http) {
  const listeners = new Set();
  let session = storage.read();
  const emit = (event) => listeners.forEach((fn) => fn(event, session));

  return {
    enabled: true,
    acceptsUsername: true,
    getSession: async () => session,
    onChange(callback) {
      listeners.add(callback);
      queueMicrotask(() => callback('INITIAL_SESSION', session));
      return () => listeners.delete(callback);
    },
    async signInWithPassword({ email: username, password }) {
      let data;
      try {
        data = await http.post('/customers/dev-login/', { username, password });
      } catch (error) {
        throw authError('invalid_credentials', error?.message || 'Usuario o contraseña incorrectos.');
      }
      session = {
        accessToken: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        user: { ...data.user, avatarUrl: '' },
      };
      storage.write(session);
      emit('SIGNED_IN');
    },
    async signOut() {
      session = null;
      storage.write(null);
      emit('SIGNED_OUT');
    },
    signInWithGoogle: unavailable,
    signUp: unavailable,
    resendConfirmation: unavailable,
    requestPasswordReset: unavailable,
    updatePassword: unavailable,
  };
}
