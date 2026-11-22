/**
 * Formas de recibir el pedido — patrón Strategy.
 *
 *   envia_home     a domicilio (Correo Argentino / Andreani vía Envia)
 *   envia_branch   retiro en una sucursal del correo
 *   pickup_store   retiro en persona, sin costo
 *
 * El precio de Envia NO se calcula acá: lo cotiza el backend (POST /shipping/quote/)
 * y cada opción trae un `token` firmado que viaja con la orden. Cada estrategia
 * sabe qué datos pide, cómo validarlos y cómo se serializan para POST /orders/.
 */
import { PICKUP_ADDRESS } from '@/config/site';

export const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos',
  'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

export const HOME = 'home';
export const BRANCH = 'branch';
const ZIP = /^\d{4}$/;

/** Lo mínimo para cotizar: CP, provincia y ciudad. */
export const canQuote = (form) => ZIP.test((form.shipping_zip || '').trim()) && Boolean(form.shipping_province) && (form.shipping_city || '').trim().length >= 2;

/** Identifica la cotización: si cambia el destino o el carrito, se vuelve a cotizar. */
export const quoteKey = (form, items) =>
  [form.shipping_zip?.trim(), form.shipping_province, form.shipping_city?.trim().toLowerCase(),
    items.map((i) => `${i.id}x${i.quantity}`).sort().join(',')].join('|');

export const methodForKind = (kind) => (kind === BRANCH ? 'envia_branch' : 'envia_home');

function validateDestination(form, { street }) {
  const errors = {};
  if (!form.shipping_province) errors.shipping_province = 'Seleccioná una provincia.';
  if (!form.shipping_city?.trim()) errors.shipping_city = 'La ciudad es obligatoria.';
  const zip = form.shipping_zip?.trim() || '';
  if (!zip) errors.shipping_zip = 'El código postal es obligatorio.';
  else if (!ZIP.test(zip)) errors.shipping_zip = 'El código postal debe tener 4 dígitos.';
  if (street) {
    if (!form.shipping_address?.trim()) errors.shipping_address = 'La calle es obligatoria.';
    if (!form.shipping_street_number?.trim()) errors.shipping_street_number = 'El número es obligatorio.';
  }
  if (!form.shipping_quote) errors.shipping_quote = 'Elegí una opción de envío.';
  return errors;
}

const destinationPayload = (form) => ({
  shipping_type: 'home',
  shipping_city: form.shipping_city.trim(),
  shipping_province: form.shipping_province,
  shipping_zip: form.shipping_zip.trim(),
  shipping_quote: form.shipping_quote,
});

export const SHIPPING_METHODS = Object.freeze({
  envia_home: {
    id: 'envia_home',
    kind: HOME,
    label: 'Envío a domicilio',
    description: 'Correo Argentino o Andreani hasta tu puerta, a todo el país.',
    needsAddress: true,
    validate: (form) => validateDestination(form, { street: true }),
    toPayload: (form) => ({
      ...destinationPayload(form),
      shipping_method: 'envia_home',
      shipping_address: form.shipping_address.trim(),
      shipping_street_number: form.shipping_street_number.trim(),
      shipping_apartment: form.shipping_apartment?.trim() || '',
      shipping_branch: '',
      shipping_branch_code: '',
    }),
  },
  envia_branch: {
    id: 'envia_branch',
    kind: BRANCH,
    label: 'Retiro en sucursal del correo',
    description: 'Lo retirás en la sucursal de Correo Argentino o Andreani que elijas. Suele ser lo más barato.',
    needsAddress: true,
    validate: (form) => {
      const errors = validateDestination(form, { street: false });
      if (form.shipping_quote && !form.shipping_branch_code) errors.shipping_branch_code = 'Elegí la sucursal donde retirás.';
      return errors;
    },
    toPayload: (form) => ({
      ...destinationPayload(form),
      shipping_method: 'envia_branch',
      shipping_branch_code: form.shipping_branch_code,
      shipping_branch: form.shipping_branch || '',
      shipping_address: form.shipping_address?.trim() || '',
      shipping_street_number: form.shipping_street_number?.trim() || '',
      shipping_apartment: '',
    }),
  },
  pickup_store: {
    id: 'pickup_store',
    label: 'Retiro en persona',
    description: 'Sin costo. Coordinamos día y horario por WhatsApp.',
    needsAddress: false,
    validate: () => ({}),
    toPayload: () => ({
      shipping_type: 'pickup',
      shipping_method: 'pickup_store',
      shipping_branch: PICKUP_ADDRESS,
      shipping_address: '',
      shipping_city: '',
      shipping_province: '',
      shipping_zip: '',
    }),
  },
});

export const SHIPPING_METHOD_LIST = Object.values(SHIPPING_METHODS);

export const getShippingMethod = (id) => SHIPPING_METHODS[id] || null;

/** Opciones de Envia agrupadas por modalidad, ya vienen ordenadas por precio. */
export function groupOptions(options = []) {
  return {
    [HOME]: options.filter((o) => o.kind === HOME),
    [BRANCH]: options.filter((o) => o.kind === BRANCH),
  };
}

/** Misma opción en una cotización nueva (otro token): mismo correo, servicio y modalidad. */
export const sameOption = (a, b) => Boolean(a && b) && a.carrier === b.carrier && a.service === b.service && a.kind === b.kind;
