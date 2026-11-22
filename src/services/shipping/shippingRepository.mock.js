import { ApiError } from '../http/ApiError';

/** Envíos en memoria (tests): mismas opciones que el Envia falso del backend. */
export const MOCK_SHIPPING_OPTIONS = [
  { token: 'q-ca-suc', carrier: 'correo_argentino', carrier_name: 'Correo Argentino', service: 'standard_suc', service_name: 'Paq.ar Clásico a sucursal', kind: 'branch', price: 4800, eta: '3-5 días hábiles', eta_days: 5, cheapest: true },
  { token: 'q-an-suc', carrier: 'andreani', carrier_name: 'Andreani', service: 'sucursal', service_name: 'Andreani a sucursal', kind: 'branch', price: 5200, eta: '2-3 días hábiles', eta_days: 3, cheapest: false },
  { token: 'q-ca-dom', carrier: 'correo_argentino', carrier_name: 'Correo Argentino', service: 'standard_dom', service_name: 'Paq.ar Clásico a domicilio', kind: 'home', price: 6500, eta: '3-5 días hábiles', eta_days: 5, cheapest: true },
  { token: 'q-an-dom', carrier: 'andreani', carrier_name: 'Andreani', service: 'estandar', service_name: 'Andreani Estándar', kind: 'home', price: 8200, eta: '2-3 días hábiles', eta_days: 3, cheapest: false },
];

export const MOCK_BRANCHES = [
  { code: 'MDQ01', name: 'Sucursal Centro', address: 'San Martín 2500', city: 'Mar del Plata', province: 'BA', zip: '7600', distance_km: 1.2 },
  { code: 'MDQ02', name: 'Sucursal Puerto', address: '12 de Octubre 3100', city: 'Mar del Plata', province: 'BA', zip: '7600', distance_km: 4.8 },
];

export function createMockShippingRepository() {
  return {
    async quote({ zip }) {
      if (!/^\d{4}$/.test(zip)) throw new ApiError('El código postal debe tener 4 dígitos.', { status: 400 });
      return { options: MOCK_SHIPPING_OPTIONS };
    },
    async branches() {
      return MOCK_BRANCHES;
    },
  };
}
