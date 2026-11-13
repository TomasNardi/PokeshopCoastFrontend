/**
 * ============================================================================
 *  MODO PRESENTACIÓN — se controla con la variable NEXT_PUBLIC_HOME_ONLY
 * ============================================================================
 *
 *  "true"           → solo se muestra la home. El navbar y los menús se ven y
 *                     funcionan, pero ningún link lleva a otra sección (muestra
 *                     "Próximamente"), las cards no abren el producto y
 *                     cualquier URL interna vuelve a "/".
 *  sin definir/otro → sitio completo, todo navegable (así se trabaja en local).
 *
 *  Producción (Vercel): Settings → Environment Variables → NEXT_PUBLIC_HOME_ONLY=true
 *  y Redeploy (las NEXT_PUBLIC_* se graban en el build).
 *  Para liberar el sitio: borrar la variable (o ponerla en false) y redeployar.
 *
 *  Se lee literal (process.env.NEXT_PUBLIC_HOME_ONLY): Next la reemplaza en el
 *  build, también en el middleware y en el navegador.
 */
export const PRESENTATION_MODE = process.env.NEXT_PUBLIC_HOME_ONLY === 'true';
