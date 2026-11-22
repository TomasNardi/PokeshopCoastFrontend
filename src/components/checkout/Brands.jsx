/* eslint-disable @next/next/no-img-element */
import { Landmark, Truck } from 'lucide-react';

/**
 * Marcas del checkout. Los archivos viven en /public/brands: para usar el logo
 * oficial alcanza con reemplazar el SVG (mismo nombre), sin tocar código.
 */
const CARRIER_LOGOS = { correo_argentino: '/brands/correo-argentino.svg', andreani: '/brands/andreani.svg' };

export function CarrierMark({ carrier, name }) {
  const src = CARRIER_LOGOS[carrier];
  if (!src) {
    return <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-uns-stage"><Truck size={16} /></span>;
  }
  return <img src={src} alt={name} width={36} height={36} className="h-9 w-9 shrink-0" loading="lazy" />;
}

export function PaymentMark({ method }) {
  if (method === 'mercadopago') {
    return <img src="/brands/mercadopago.svg" alt="Mercado Pago" width={116} height={30} className="h-[30px] w-auto" />;
  }
  return (
    <span className="inline-flex h-[30px] items-center gap-2 border border-black px-2.5 text-[11px] font-bold uppercase tracking-[0.1em]">
      <Landmark size={15} /> Transferencia
    </span>
  );
}
