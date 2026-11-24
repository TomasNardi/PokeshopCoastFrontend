import LegalPage from '@/components/ui/LegalPage';

export const metadata = { title: 'Términos y condiciones' };

const SECTIONS = [
  { title: 'Productos', body: 'Las fotos corresponden a la unidad que se vende. El estado de cada carta se informa según la escala Mint / Near Mint / Lightly Played / Moderately Played / Damaged.' },
  { title: 'Precios y pagos', body: 'Los precios están expresados en pesos argentinos. El total final se confirma al crear el pedido. Los pagos se procesan con Mercado Pago o transferencia bancaria.' },
  { title: 'Envíos', body: 'Los plazos de entrega son estimados y dependen del correo. El seguimiento se informa por email.' },
  { title: 'Cambios y devoluciones', body: 'Si recibiste un producto con una falla, un daño no informado o distinto al que compraste, escribinos dentro de las 24 horas corridas de recibido. Las condiciones completas están en la Política de cambios, devoluciones y reclamos (pokeshopcoast.com.ar/cambios-y-devoluciones).' },
];

export default function Page() {
  return <LegalPage title="Términos y condiciones" sections={SECTIONS} />;
}
