import LegalPage from '@/components/ui/LegalPage';

export const metadata = { title: 'Política de cambios, devoluciones y reclamos' };

// Texto provisto por el dueño (24/11/2026).
const INTRO = [
  'En Pokeshopcoast trabajamos para ofrecer productos correctamente identificados, revisados y detallados, procurando que cada cliente reciba exactamente aquello que adquirió.',
  'Debido a la naturaleza de nuestros productos, especialmente cartas coleccionables, cartas individuales y productos sellados, establecemos las siguientes condiciones comerciales:',
];

const SECTIONS = [
  {
    title: '1. Estado de los productos',
    blocks: [
      'Todos nuestros productos se ofrecen con una descripción de su estado y condición, incluyendo fotografías y detalles cuando corresponda.',
      'En el caso de cartas individuales, las condiciones de conservación se informan de acuerdo con su estado visible al momento de la publicación.',
    ],
  },
  {
    title: '2. Reclamos por fallas, daños o errores',
    blocks: [
      'Si el cliente recibe un producto con una falla, daño no informado o diferente al adquirido, deberá comunicarse con Pokeshopcoast dentro de las primeras 24 horas corridas desde la recepción del pedido.',
      'Para facilitar la evaluación del reclamo, solicitamos:',
      { list: ['Número de pedido o comprobante de compra.', 'Fotografías o videos del producto recibido.', 'Descripción detallada del inconveniente.'] },
      'El producto deberá conservarse en las condiciones en que fue recibido, sin modificaciones, alteraciones ni manipulaciones que puedan dificultar la evaluación del reclamo.',
      'Pokeshopcoast analizará cada caso y ofrecerá una solución conforme a la normativa vigente.',
      { strong: 'Pasadas 24 horas no se aceptará ningún tipo de reclamo.' },
    ],
  },
  {
    title: '3. Productos coleccionables y cartas individuales',
    blocks: [
      'Debido a las características particulares del mercado de cartas coleccionables, recomendamos revisar cuidadosamente las fotografías, descripciones y condiciones de conservación antes de concretar una compra.',
      'Las diferencias propias del proceso de fabricación, antigüedad o conservación de cartas usadas deberán evaluarse según la descripción y el estado informado en la publicación.',
      'No se considerará una falla una característica que haya sido debidamente informada y aceptada al momento de la compra.',
    ],
  },
  {
    title: '4. Productos sellados',
    blocks: [
      'Los productos comercializados como sellados deben conservar sus envoltorios, precintos y embalajes originales.',
      'No se aceptarán reclamos por daños ocasionados por la apertura, manipulación o alteración del sellado por parte del comprador, sin perjuicio de los derechos legales que correspondan.',
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Cambios, devoluciones y reclamos"
      updated="Última actualización: 1 de diciembre de 2026"
      intro={INTRO}
      sections={SECTIONS}
      final
    />
  );
}
