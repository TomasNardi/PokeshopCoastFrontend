/**
 * Adapter: Supabase Auth → interfaz AuthProvider.
 *
 * Interfaz AuthProvider (la implementan también mockAuthProvider y disabledAuthProvider):
 *   enabled: boolean
 *   getSession() → { accessToken, user: { id, email, name, avatarUrl } } | null
 *   onChange((event, session) => void) → unsubscribe()
 *       event: 'SIGNED_IN' | 'SIGNED_OUT' | 'PASSWORD_RECOVERY' | 'TOKEN_REFRESHED' | 'INITIAL_SESSION'
 *   signInWithGoogle({ redirectTo })
 *   signInWithPassword({ email, password })
 *   signUp({ email, password, redirectTo })
 *   signOut()
 *   requestPasswordReset({ email, redirectTo })
 *   updatePassword(password)
 *   resendConfirmation({ email, redirectTo })
 *
 * supabase-js se importa diferido: no pesa en el bundle inicial del home.
 * Los mails (confirmación / recuperación) los manda Supabase vía SMTP de Resend.
 */

const toSession = (session) =>
  session
    ? {
        accessToken: session.access_token,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          avatarUrl: session.user.user_metadata?.avatar_url || '',
          provider: session.user.app_metadata?.provider || 'email',
        },
      }
    : null;

export function createSupabaseAuthProvider({ url, key }) {
  let clientPromise = null;
  const client = () => {
    clientPromise ||= import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
      })
    );
    return clientPromise;
  };

  /** Supabase devuelve { data, error } en vez de tirar: lo normalizamos a throw. */
  const run = async (fn) => {
    const { data, error } = await fn(await client());
    if (error) throw error;
    return data;
  };

  return {
    enabled: true,
    async getSession() {
      const data = await run((s) => s.auth.getSession());
      return toSession(data.session);
    },
    onChange(callback) {
      let subscription = null;
      let cancelled = false;
      client().then((s) => {
        if (cancelled) return;
        subscription = s.auth.onAuthStateChange((event, session) => {
          // Supabase pide no llamar a su API dentro del callback: se difiere.
          setTimeout(() => callback(event, toSession(session)), 0);
        }).data.subscription;
      });
      return () => {
        cancelled = true;
        subscription?.unsubscribe();
      };
    },
    signInWithGoogle: ({ redirectTo }) =>
      run((s) =>
        s.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, queryParams: { prompt: 'select_account' } },
        })
      ),
    signInWithPassword: ({ email, password }) => run((s) => s.auth.signInWithPassword({ email, password })),
    signUp: ({ email, password, redirectTo }) =>
      run((s) => s.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })),
    signOut: () => run((s) => s.auth.signOut()),
    requestPasswordReset: ({ email, redirectTo }) =>
      run((s) => s.auth.resetPasswordForEmail(email, { redirectTo })),
    updatePassword: (password) => run((s) => s.auth.updateUser({ password })),
    resendConfirmation: ({ email, redirectTo }) =>
      run((s) => s.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } })),
  };
}
