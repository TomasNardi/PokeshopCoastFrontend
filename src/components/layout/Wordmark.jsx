import Link from 'next/link';
import Image from 'next/image';

/**
 * Logo de la marca (public/brand/pokeshop-logo.png, 190×192). Chico y sutil:
 * el tamaño lo pone `.wordmark` (header) o la clase que se pase (footer).
 */
export default function Wordmark({ className = '' }) {
  return (
    <Link href="/" aria-label="PokeShop Coast — inicio" className={`wordmark ${className}`}>
      <Image src="/brand/pokeshop-logo.png" alt="PokeShop Coast" width={190} height={192} priority className="wordmark__img" />
    </Link>
  );
}
