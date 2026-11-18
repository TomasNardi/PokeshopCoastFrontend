/**
 * Única puerta de entrada a las variables de entorno.
 *
 * Las NEXT_PUBLIC_* se leen literal (process.env.NEXT_PUBLIC_X) porque Next
 * las reemplaza en build por texto: un acceso dinámico (process.env[key])
 * queda undefined en el browser.
 */

const toBool = (value, fallback) => {
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

export const env = Object.freeze({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  useMocks: toBool(process.env.NEXT_PUBLIC_USE_MOCKS, true),
  // Solo con mocks: demora artificial para revisar los estados de carga en local.
  mockLatencyMs: Number(process.env.NEXT_PUBLIC_MOCK_LATENCY_MS) || 0,
  // Login de prueba contra el backend local (tomi / tomi). Nunca en producción.
  devLogin: toBool(process.env.NEXT_PUBLIC_DEV_LOGIN, false),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492257554759',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@pokeshopcoast.com',
});

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseKey);
