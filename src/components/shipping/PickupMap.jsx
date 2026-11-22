import { MapPin, Navigation } from 'lucide-react';
import { PICKUP_POINT } from '@/config/site';

const point = `${PICKUP_POINT.lat},${PICKUP_POINT.lng}`;

/**
 * Mini mapa del punto de retiro (Google Maps embebido, sin API key) y link
 * «Cómo llegar». Carga diferida: no pesa hasta que se ve.
 */
export default function PickupMap({ className = '' }) {
  return (
    <div className={`overflow-hidden border border-uns-hairline bg-white ${className}`}>
      <iframe
        title={`Mapa: ${PICKUP_POINT.street}, ${PICKUP_POINT.city}`}
        src={`https://www.google.com/maps?q=${point}&z=${PICKUP_POINT.zoom}&output=embed`}
        className="block h-48 w-full border-0 sm:h-56"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5">
        <p className="flex items-start gap-2 text-[13px] leading-snug">
          <MapPin size={16} className="mt-0.5 shrink-0 text-coast-red" />
          <span>
            <strong className="block">{PICKUP_POINT.street}</strong>
            <span className="text-uns-muted">{PICKUP_POINT.city}, {PICKUP_POINT.province}</span>
          </span>
        </p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${point}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border border-black px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-black hover:text-white"
        >
          <Navigation size={13} /> Cómo llegar
        </a>
      </div>
    </div>
  );
}
