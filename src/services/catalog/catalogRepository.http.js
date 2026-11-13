import { toQuery, unwrapList } from '../http/httpClient';

/**
 * Repositorio de catálogo contra Django. Endpoints idénticos a Crack.
 * Interfaz (la implementa también catalogRepository.mock.js):
 *   listProducts(filters) → { count, results, next, previous }
 *   getProduct(slug) → product   (ApiError 404 si no existe)
 *   getProductsByIds(ids) → product[]
 *   getNewArrivals() / getFeatured() → product[]
 *   getCategories() / getConditions() / getCertificationEntities() → []
 */
export function createHttpCatalogRepository(http) {
  // Stock fresco siempre: después de un checkout la vuelta atrás no puede mostrar stock viejo.
  const fresh = { cache: 'no-store' };
  const cached = { next: { revalidate: 1800 } };

  return {
    listProducts: (filters = {}) => http.get(`/products/${toQuery(filters)}`, fresh),
    getProduct: (slug) => http.get(`/products/${encodeURIComponent(slug)}/`, fresh),
    getProductsByIds: async (ids = []) => {
      const clean = [...new Set(ids.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
      if (clean.length === 0) return [];
      return unwrapList(await http.get(`/products/by-ids/${toQuery({ ids: clean.join(',') })}`, fresh));
    },
    getNewArrivals: async () => unwrapList(await http.get('/products/new-arrivals/', fresh)),
    getFeatured: async () => unwrapList(await http.get('/products/featured/', fresh)),
    getCategories: async () => unwrapList(await http.get('/categories/', cached)),
    getConditions: async () => unwrapList(await http.get('/conditions/', cached)),
    getCertificationEntities: async () => unwrapList(await http.get('/certification-entities/', cached)),
  };
}
