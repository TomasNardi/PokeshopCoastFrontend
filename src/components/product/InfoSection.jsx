'use client';
import { useId, useState } from 'react';
import { Plus } from 'lucide-react';

/**
 * Desplegable de la ficha (Descripción, Detalles, Envíos y pagos), como
 * unsobremas: abre y cierra con transición de altura (grid 0fr → 1fr) y un
 * fundido del contenido, no de golpe. Arranca cerrado. El texto queda siempre
 * en el HTML (cerrado solo se oculta), así Google lo lee igual.
 */
export default function InfoSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`product-info ${open ? 'is-open' : ''}`}>
      <h3 className="m-0">
        <button
          type="button"
          className="product-info__summary w-full text-left"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          <span>{title}</span>
          <Plus size={16} strokeWidth={2.2} className="product-info__icon" aria-hidden="true" />
        </button>
      </h3>
      <div id={id} className="product-info__panel" role="region" aria-label={title} inert={!open}>
        <div className="product-info__inner">
          <div className="product-info__body">{children}</div>
        </div>
      </div>
    </div>
  );
}
