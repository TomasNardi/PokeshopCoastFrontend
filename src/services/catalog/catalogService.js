import { PAGE_SIZE, normalizeFilters } from '@/domain/catalog';

/**
 * Casos de uso del catálogo. No sabe si habla con Django o con mocks: recibe
 * un repositorio con la interfaz de catalogRepository.http.js.
 *
 * Regla de resiliencia: las secciones decorativas del home nunca rompen la
 * página (devuelven []). La tienda y el detalle sí propagan el error para que
 * se vea el error boundary.
 */
export function createCatalogService(repository, { pageSize = PAGE_SIZE } = {}) {
  const safeList = async (fn) => {
    try {
      return await fn();
    } catch {
      return [];
    }
  };

  return {
    async getProductPage(rawFilters = {}) {
      const filters = normalizeFilters(rawFilters);
      const data = await repository.listProducts(filters);
      const total = Number(data?.count || 0);
      return {
        items: data?.results || [],
        total,
        page: filters.page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        filters,
      };
    },

    /** null si no existe (la página llama a notFound()). */
    async getProduct(slug) {
      try {
        return await repository.getProduct(slug);
      } catch (error) {
        if (error?.status === 404) return null;
        throw error;
      }
    },

    async getRelated(product, limit = 4) {
      if (!product?.category) return [];
      const slug = typeof product.category === 'object' ? product.category.slug : product.category;
      const page = await safeList(async () => (await repository.listProducts({ category: slug, in_stock: true })).results);
      return page.filter((p) => p.id !== product.id).slice(0, limit);
    },

    getProductsByIds: (ids) => repository.getProductsByIds(ids),
    getNewArrivals: () => safeList(() => repository.getNewArrivals()),
    getFeatured: () => safeList(() => repository.getFeatured()),
    getCategories: () => safeList(() => repository.getCategories()),
    getConditions: () => safeList(() => repository.getConditions()),
    getCertificationEntities: () => safeList(() => repository.getCertificationEntities()),
  };
}
