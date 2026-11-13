/**
 * Métodos de envío — patrón Strategy.
 *
 * Cada método sabe: si necesita dirección, cómo validar el formulario, cuánto
 * cuesta según la config del backend, y cómo se serializa para POST /orders/
 * (mismo contrato que Crack: shipping_type / shipping_method / shipping_zone).
 * Sumar un método (ej. moto en el día) = agregar una entrada acá.
 */
import { PICKUP_ADDRESS } from '@/config/site';

export const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos',
  'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

const BA_ZONE = new Set(['Buenos Aires', 'CABA']);

/** 'ba' | 'province' — la zona tarifaria del backend. */
export const shippingZoneFor = (province) => (BA_ZONE.has(province) ? 'ba' : 'province');

function validateAddress(form, place) {
  const errors = {};
  if (!form.shipping_address?.trim()) errors.shipping_address = `La dirección ${place} es obligatoria.`;
  if (!form.shipping_city?.trim()) errors.shipping_city = 'La ciudad es obligatoria.';
  if (!form.shipping_province) errors.shipping_province = 'Seleccioná una provincia.';
  const zip = form.shipping_zip?.trim() || '';
  if (!zip) errors.shipping_zip = 'El código postal es obligatorio.';
  else if (!/^\d{4}$/.test(zip)) errors.shipping_zip = 'El código postal debe tener 4 dígitos.';
  return errors;
}

const addressPayload = (form) => ({
  shipping_address: form.shipping_address.trim(),
  shipping_city: form.shipping_city.trim(),
  shipping_province: form.shipping_province,
  shipping_zip: form.shipping_zip.trim(),
});

const branchMethod = (id, speed, label, eta) => ({
  id,
  label,
  description: `Retirás en una sucursal de correo. ${eta}.`,
  needsAddress: true,
  addressLabel: 'Dirección de la sucursal',
  price: (config, zone) => config?.shipping_prices?.branch?.[zone]?.[speed] ?? null,
  validate: (form) => validateAddress(form, 'de la sucursal'),
  toPayload: (form) => ({
    shipping_type: 'home',
    shipping_method: id,
    shipping_zone: shippingZoneFor(form.shipping_province),
    shipping_branch: 'Sucursal de correo',
    ...addressPayload(form),
  }),
});

export const SHIPPING_METHODS = Object.freeze({
  pickup_store: {
    id: 'pickup_store',
    label: 'Retiro en persona',
    description: 'Sin costo. Coordinamos día y horario por WhatsApp.',
    needsAddress: false,
    price: () => 0,
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
  branch_normal: branchMethod('branch_normal', 'normal', 'Sucursal de correo', '3 a 6 días hábiles'),
  branch_express: branchMethod('branch_express', 'express', 'Sucursal de correo — Express', '1 a 3 días hábiles'),
  home: {
    id: 'home',
    label: 'Envío a domicilio',
    description: 'Te lo llevamos a tu casa. 3 a 7 días hábiles.',
    needsAddress: true,
    addressLabel: 'Dirección (calle, número, piso)',
    price: (config, zone) => config?.shipping_prices?.home?.[zone]?.normal ?? null,
    validate: (form) => validateAddress(form, 'de entrega'),
    toPayload: (form) => ({
      shipping_type: 'home',
      shipping_method: 'home',
      shipping_zone: shippingZoneFor(form.shipping_province),
      shipping_branch: '',
      ...addressPayload(form),
    }),
  },
});

export const SHIPPING_METHOD_LIST = Object.values(SHIPPING_METHODS);

export const getShippingMethod = (id) => SHIPPING_METHODS[id] || null;

/** Costo de envío para el form actual. null = no se puede calcular todavía. */
export function quoteShipping(methodId, form, config) {
  const method = getShippingMethod(methodId);
  if (!method) return null;
  if (!method.needsAddress) return method.price(config);
  if (!form.shipping_province) return null;
  return method.price(config, shippingZoneFor(form.shipping_province));
}
