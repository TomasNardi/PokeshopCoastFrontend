/**
 * AuthProvider en memoria para maquetar y testear sin Supabase.
 * Usuario demo: demo@pokeshopcoast.com / Coast123!
 * "Ingresar con Google" loguea directo como un usuario de Google simulado.
 */
const STORAGE_KEY = 'psc-mock-session';

const storage = {
  read() {
    try {
      return JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) || 'null');
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

export function createMockAuthProvider({ users = { 'demo@pokeshopcoast.com': 'Coast123!' }, persist = true } = {}) {
  const accounts = new Map(Object.entries(users));
  const listeners = new Set();
  let session = persist ? storage.read() : null;
  const sentEmails = []; // inspeccionable en tests: [{ type, email, redirectTo }]
  let recoveryEmail = null;

  const emit = (event) => listeners.forEach((fn) => fn(event, session));
  const setSession = (email, provider = 'email') => {
    session = {
      accessToken: `mock-token-${email}`,
      user: { id: `mock-${email}`, email, name: provider === 'google' ? 'Coast Trainer' : '', avatarUrl: '', provider },
    };
    if (persist) storage.write(session);
    emit('SIGNED_IN');
  };

  return {
    enabled: true,
    sentEmails,
    getSession: async () => session,
    onChange(callback) {
      listeners.add(callback);
      queueMicrotask(() => callback('INITIAL_SESSION', session));
      return () => listeners.delete(callback);
    },
    async signInWithGoogle() {
      setSession('trainer@gmail.com', 'google');
    },
    async signInWithPassword({ email, password }) {
      if (accounts.get(email) !== password) throw authError('invalid_credentials', 'Invalid login credentials');
      setSession(email);
    },
    async signUp({ email, password, redirectTo }) {
      if (accounts.has(email)) throw authError('user_already_exists', 'User already registered');
      accounts.set(email, password);
      sentEmails.push({ type: 'signup', email, redirectTo });
    },
    async signOut() {
      session = null;
      if (persist) storage.write(null);
      emit('SIGNED_OUT');
    },
    async requestPasswordReset({ email, redirectTo }) {
      // Igual que Supabase: no revela si la cuenta existe.
      sentEmails.push({ type: 'recovery', email, redirectTo });
      if (accounts.has(email)) recoveryEmail = email;
    },
    /** Solo mocks/tests: simula que el usuario abrió el link del mail. */
    simulateRecoveryLink() {
      if (!recoveryEmail) throw new Error('No hay recuperación pendiente');
      setSession(recoveryEmail);
      emit('PASSWORD_RECOVERY');
    },
    async updatePassword(password) {
      if (!session) throw authError('session_not_found', 'Auth session missing');
      if (accounts.get(session.user.email) === password) throw authError('same_password', 'Same password');
      accounts.set(session.user.email, password);
    },
    async resendConfirmation({ email, redirectTo }) {
      sentEmails.push({ type: 'signup', email, redirectTo });
    },
  };
}
