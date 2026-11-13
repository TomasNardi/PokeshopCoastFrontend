import Link from 'next/link';

/**
 * Detalle del daño de un producto outlet. Va siempre a la vista en la ficha:
 * en el outlet el cliente compra sabiendo exactamente qué tiene la pieza.
 */
export default function DamageNote({ note }) {
  return (
    <div className="border-l-[3px] border-coast-red-dark bg-uns-stage px-4 py-3.5">
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-coast-red-dark">Producto outlet · detalle del daño</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-black">
        {note || 'Producto con detalles de conservación. Escribinos y te mandamos fotos.'}
      </p>
      <p className="mt-2 text-[12px] text-uns-muted">
        Las fotos muestran el estado real. Sin cambios por el daño descripto ·{' '}
        <Link href="/outlet" className="font-bold underline underline-offset-2 hover:text-black">Ver outlet</Link>
      </p>
    </div>
  );
}
