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

/** Tarjetas que acepta Mercado Pago (mismos SVG que Crack, en /public/payments). */
const CARDS = [
  { id: 'visa', name: 'Visa' },
  { id: 'mastercard', name: 'Mastercard' },
  { id: 'amex', name: 'American Express' },
  { id: 'maestro', name: 'Maestro' },
  { id: 'diners', name: 'Diners Club' },
];

function Chip({ id, name, big = false }) {
  const size = big ? 'h-[30px] w-[48px]' : 'h-[22px] w-[35px] sm:h-6 sm:w-[38px]';
  return <img src={`/payments/${id}.svg`} alt={name} title={name} width={38} height={24} className={`${size} shrink-0`} loading="lazy" />;
}

export function PaymentMark({ method }) {
  if (method === 'mercadopago') {
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Chip id="mercadopago" name="Mercado Pago" big />
        <span className="flex flex-wrap items-center gap-1.5" aria-label="Tarjetas aceptadas">
          {CARDS.map((c) => <Chip key={c.id} {...c} />)}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-[30px] items-center gap-2 border border-black px-2.5 text-[11px] font-bold uppercase tracking-[0.1em]">
      <Landmark size={15} /> Transferencia
    </span>
  );
}
