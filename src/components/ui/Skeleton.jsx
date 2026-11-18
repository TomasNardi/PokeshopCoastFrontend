/**
 * Esqueletos de carga
 * ===================
 * Bloques grises con brillo (`.skeleton` en globals.css; sin animación si el
 * usuario pidió menos movimiento). Son decorativos: el contenedor que los
 * agrupa anuncia la carga una sola vez con <LoadingRegion>.
 */

export function Skeleton({ as: Tag = 'span', className = '', style }) {
  return <Tag className={`skeleton block rounded-lg ${className}`} style={style} aria-hidden="true" />;
}

/**
 * Una línea de texto falsa con la altura real del texto que reemplaza: se usa
 * DENTRO del elemento con la tipografía final (h3, p…), así la línea mide lo
 * mismo que cuando llega el contenido y la página no salta.
 */
export function SkeletonText({ width = '100%', className = '' }) {
  return (
    <span
      className={`skeleton inline-block h-[0.9em] max-w-full rounded align-middle ${className}`}
      style={{ width }}
      aria-hidden="true"
    />
  );
}

/** Contenedor accesible: el lector de pantalla dice "Cargando…" una vez, no por cada bloque. */
export function LoadingRegion({ label = 'Cargando', as: Tag = 'div', className = '', children }) {
  return (
    <Tag role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </Tag>
  );
}
