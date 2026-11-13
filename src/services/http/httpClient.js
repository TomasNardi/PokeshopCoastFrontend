import { ApiError, NETWORK_MESSAGE } from './ApiError';

/**
 * Cliente HTTP mínimo sobre fetch. Todos los repositorios HTTP lo reciben por
 * parámetro (inyección), así en los tests se le pasa otra baseUrl o se
 * intercepta con MSW sin tocar el código de producción.
 *
 * @param {object} options
 * @param {string} options.baseUrl
 * @param {() => Promise<Record<string,string>>|Record<string,string>} [options.getHeaders] headers dinámicos (token)
 */
export function createHttpClient({ baseUrl, getHeaders = () => ({}) }) {
  async function request(path, { method = 'GET', body, headers = {}, ...init } = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const dynamicHeaders = (await getHeaders()) || {};

    let res;
    try {
      // globalThis.fetch se resuelve en cada llamada: MSW lo parchea en los tests.
      res = await globalThis.fetch(`${baseUrl}${path}`, {
        ...init,
        method,
        headers: {
          Accept: 'application/json',
          ...(isFormData || body == null ? {} : { 'Content-Type': 'application/json' }),
          ...dynamicHeaders,
          ...headers,
        },
        body: body == null ? undefined : isFormData ? body : JSON.stringify(body),
      });
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      throw new ApiError(NETWORK_MESSAGE, { status: 0 });
    }

    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw ApiError.fromResponse(res.status, data);
    return data;
  }

  return {
    request,
    get: (path, init) => request(path, { ...init, method: 'GET' }),
    post: (path, body, init) => request(path, { ...init, method: 'POST', body }),
    patch: (path, body, init) => request(path, { ...init, method: 'PATCH', body }),
    delete: (path, init) => request(path, { ...init, method: 'DELETE' }),
  };
}

/** DRF paginado ({ results }) o lista pelada → lista. */
export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/** Objeto → "?a=1&b=2", sin vacíos. "" si no queda nada. */
export function toQuery(params = {}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}
