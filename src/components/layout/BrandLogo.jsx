import Link from 'next/link';
import Image from 'next/image';

/** Logo de la marca (public/brand/pokeshop-logo.png, 190×192). Hoy solo en el pie. */
export default function BrandLogo({ className = '' }) {
  return (
    <Link href="/" aria-label="PokeShop Coast — inicio" className={`brand-logo ${className}`}>
      <Image src="/brand/pokeshop-logo.png" alt="PokeShop Coast" width={190} height={192} className="brand-logo__img" />
    </Link>
  );
}
