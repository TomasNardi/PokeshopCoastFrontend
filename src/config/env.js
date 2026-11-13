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
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5492257554759',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@pokeshopcoast.com',
  // Modo presentación: solo la home, sin menú, búsqueda, cuenta ni carrito (ver src/middleware.js).
  homeOnly: toBool(process.env.NEXT_PUBLIC_HOME_ONLY, false),
});

export const PRESENTATION_MODE = env.homeOnly;

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseKey);
