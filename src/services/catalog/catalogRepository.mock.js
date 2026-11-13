import { ApiError } from '../http/ApiError';
import { PAGE_SIZE } from '@/domain/catalog';
import {
  MOCK_CATEGORIES,
  MOCK_CERTIFICATION_ENTITIES,
  MOCK_CONDITIONS,
  MOCK_PRODUCTS,
} from '@/mocks/data/products';

const lower = (v) => String(v ?? '').toLowerCase();
const nameOf = (v) => (v && typeof v === 'object' ? v.name : v);

/** Filtra igual que el ProductFilter de Django (lo suficiente para maquetar). */
export function filterProducts(products, filters = {}) {
  let list = [...products];
  if (filters.search) {
    const q = lower(filters.search);
    list = list.filter((p) => lower(p.name).includes(q) || lower(p.catalog?.set_name).includes(q));
  }
  if (filters.category) list = list.filter((p) => p.category?.slug === filters.category);
  if (filters.condition) list = list.filter((p) => lower(nameOf(p.condition)) === lower(filters.condition));
  if (filters.certification_entity) {
    list = list.filter((p) => lower(p.certification_entity) === lower(filters.certification_entity));
  }
  if (filters.language) list = list.filter((p) => p.language === filters.language);
  if (filters.min_price) list = list.filter((p) => Number(p.final_price) >= Number(filters.min_price));
  if (filters.max_price) list = list.filter((p) => Number(p.final_price) <= Number(filters.max_price));
  if (String(filters.in_stock) === 'true') list = list.filter((p) => p.in_stock);
  if (String(filters.has_discount) === 'true') list = list.filter((p) => p.discount_percent > 0);
  if (String(filters.outlet) === 'true') list = list.filter((p) => p.is_outlet);
  // Fuera del outlet no se mezclan los productos con detalles.
  if (String(filters.outlet) === 'false') list = list.filter((p) => !p.is_outlet);

  const order = filters.ordering;
  if (order === 'price_ars') list.sort((a, b) => Number(a.final_price) - Number(b.final_price));
  if (order === '-price_ars') list.sort((a, b) => Number(b.final_price) - Number(a.final_price));
  if (order === '-created_at') list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return list;
}

export function createMockCatalogRepository({ products = MOCK_PRODUCTS, pageSize = PAGE_SIZE } = {}) {
  return {
    async listProducts(filters = {}) {
      const all = filterProducts(products, filters);
      const page = Number(filters.page) || 1;
      const start = (page - 1) * pageSize;
      return {
        count: all.length,
        next: start + pageSize < all.length ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        results: all.slice(start, start + pageSize),
      };
    },
    async getProduct(slug) {
      const found = products.find((p) => p.slug === slug);
      if (!found) throw new ApiError('No encontramos lo que buscabas.', { status: 404 });
      return found;
    },
    async getProductsByIds(ids = []) {
      const set = new Set(ids.map(Number));
      return products.filter((p) => set.has(p.id));
    },
    async getNewArrivals() {
      return [...products].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);
    },
    async getFeatured() {
      return products.filter((p) => p.is_featured);
    },
    getCategories: async () => MOCK_CATEGORIES,
    getConditions: async () => MOCK_CONDITIONS,
    getCertificationEntities: async () => MOCK_CERTIFICATION_ENTITIES,
  };
}
