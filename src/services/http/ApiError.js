/**
 * Error único de toda la capa de servicios. El `message` se muestra tal cual
 * al cliente, así que nunca lleva jerga (ni códigos ni "Failed to fetch").
 * El detalle técnico queda en `status` y `data`.
 */

export const NETWORK_MESSAGE = 'No pudimos conectarnos. Revisá tu conexión a internet y volvé a intentar.';

export function fallbackMessage(status) {
  if (status === 400) return 'Revisá los datos e intentá de nuevo.';
  if (status === 401) return 'Tu sesión venció. Volvé a ingresar.';
  if (status === 403) return 'No tenés permiso para hacer esto.';
  if (status === 404) return 'No encontramos lo que buscabas.';
  if (status === 409) return 'Algo cambió mientras completabas la operación. Actualizá la página y volvé a intentar.';
  if (status === 429) return 'Estás haciendo muchas consultas seguidas. Esperá un momento y volvé a intentar.';
  if (status >= 500) return 'Tuvimos un problema de nuestro lado. Volvé a intentar en unos minutos.';
  return 'No pudimos completar la operación. Volvé a intentar en unos minutos.';
}

/** Lista plana de mensajes de un error DRF: { detail } | { campo: [msg] } | { non_field_errors: [...] }. */
export function messagesFromBody(data) {
  if (!data || typeof data !== 'object') return [];
  if (typeof data.detail === 'string') return [data.detail];
  return Object.values(data)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value) => typeof value === 'string' && value.trim());
}

export class ApiError extends Error {
  constructor(message, { status = 0, data = {} } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  static fromResponse(status, data) {
    const [first] = messagesFromBody(data);
    return new ApiError(first || fallbackMessage(status), { status, data });
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isNotFound() {
    return this.status === 404;
  }

  /** Errores por campo, para pintarlos al lado de cada input. */
  get fieldErrors() {
    const out = {};
    for (const [key, value] of Object.entries(this.data || {})) {
      if (key === 'detail') continue;
      const msg = Array.isArray(value) ? value[0] : value;
      if (typeof msg === 'string') out[key] = msg;
    }
    return out;
  }
}
