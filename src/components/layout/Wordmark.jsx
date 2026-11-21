import Link from 'next/link';

/**
 * Logo tipográfico (el logo del cliente no se usa). Toma el color del header
 * (`currentColor`): blanco sobre el hero transparente, negro con fondo.
 * Cuando el cliente elija logo, se reemplaza este componente por su SVG.
 */
export default function Wordmark({ className = '' }) {
  return (
    <Link href="/" aria-label="PokeShop Coast — inicio" className={`wordmark ${className}`}>
      <span className="wordmark__name">PokeShop</span>
      <span className="wordmark__sub">Coast</span>
    </Link>
  );
}
