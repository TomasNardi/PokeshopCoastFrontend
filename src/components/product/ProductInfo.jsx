import Link from 'next/link';

/** Contenidos de los desplegables de la ficha (el desplegable es InfoSection.jsx). */

export function DetailRows({ rows }) {
  const visible = rows.filter(([, value]) => value);
  if (!visible.length) return null;
  return (
    <dl className="divide-y divide-coast-line">
      {visible.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-2.5 text-[13px]">
          <dt className="text-coast-gray">{label}</dt>
          <dd className="text-right font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Description({ text, fallback }) {
  const paragraphs = text ? text.split(/\n{2,}|\r\n\r\n/).map((p) => p.trim()).filter(Boolean) : fallback;
  return (
    <div className="space-y-3 text-[14px] leading-relaxed text-coast-gray">
      {paragraphs.map((p) => <p key={p} className="whitespace-pre-line">{p}</p>)}
    </div>
  );
}

export function ShippingInfo() {
  return (
    <div className="space-y-2 text-[14px] leading-relaxed text-coast-gray">
      <p>Enviamos a todo el país por correo, o retirás en persona en la costa.</p>
      <p>Pagás con Mercado Pago (tarjetas y cuotas) o por transferencia, con el precio de transferencia más bajo.</p>
      <Link href="/envios" className="inline-block font-semibold text-coast-ink underline underline-offset-4">Ver costos y tiempos de envío</Link>
    </div>
  );
}
