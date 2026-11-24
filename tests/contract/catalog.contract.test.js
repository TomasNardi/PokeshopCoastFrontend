/**
 * Contrato de catálogo: repositorio HTTP + servicio contra el backend emulado
 * (MSW). Valida URLs, query params y que el front entienda las respuestas DRF.
 */
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, setupMswServer } from '../msw/server';
import { API } from '../msw/handlers';
import { createHttpClient } from '@/services/http/httpClient';
import { createHttpCatalogRepository } from '@/services/catalog/catalogRepository.http';
import { createCatalogService } from '@/services/catalog/catalogService';
import { ApiError } from '@/services/http/ApiError';
import { productView } from '@/domain/product';

setupMswServer();

const repo = createHttpCatalogRepository(createHttpClient({ baseUrl: API }));
const catalog = createCatalogService(repo);

describe('GET /products/', () => {
  it('pagina y filtra con los query params de Django', async () => {
    const page = await catalog.getProductPage({ category: 'singles', in_stock: 'true', page: '1' });
    expect(page.total).toBeGreaterThan(0);
    expect(page.items.every((p) => p.category.slug === 'singles' && p.in_stock)).toBe(true);
    expect(page.totalPages).toBe(Math.ceil(page.total / 12));
  });

  it('manda solo filtros conocidos y no vacíos', async () => {
    let url;
    server.use(
      http.get(`${API}/products/`, ({ request }) => {
        url = new URL(request.url);
        return HttpResponse.json({ count: 0, results: [] });
      })
    );
    await catalog.getProductPage({ category: 'slabs', search: '', inyectado: 'x', ordering: '-price_ars' });
    expect(Object.fromEntries(url.searchParams)).toEqual({ category: 'slabs', ordering: '-price_ars', page: '1' });
  });

  it('cada producto que devuelve el backend se puede pintar', async () => {
    const page = await catalog.getProductPage({});
    for (const product of page.items) {
      const view = productView(product);
      expect(view.title).toBeTruthy();
      expect(Number.isFinite(view.price)).toBe(true);
      expect(view.href).toMatch(/^\/tienda\//);
    }
  });
});

describe('GET /products/:slug/', () => {
  it('trae el detalle', async () => {
    expect((await catalog.getProduct('charizard-ex-199-151')).id).toBe(1);
  });

  it('404 → null (la página llama notFound)', async () => {
    expect(await catalog.getProduct('no-existe')).toBeNull();
  });

  it('500 se propaga como ApiError con mensaje para el cliente', async () => {
    server.use(http.get(`${API}/products/:slug/`, () => HttpResponse.json({}, { status: 500 })));
    const error = await catalog.getProduct('x').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
    expect(error.message).toMatch(/problema de nuestro lado/);
  });
});

describe('listas del home y filtros', () => {
  it('desenvuelve listas peladas y paginadas por igual', async () => {
    expect((await catalog.getNewArrivals()).length).toBeGreaterThan(0); // lista pelada
    expect((await catalog.getFeatured()).every((p) => p.is_featured)).toBe(true); // { results }
    expect((await catalog.getConditions()).map((c) => c.name)).toContain('Near Mint');
  });

  it('by-ids manda ids únicos y válidos', async () => {
    let ids;
    server.use(
      http.get(`${API}/products/by-ids/`, ({ request }) => {
        ids = new URL(request.url).searchParams.get('ids');
        return HttpResponse.json([]);
      })
    );
    await catalog.getProductsByIds([3, '3', 1, -1, 'x']);
    expect(ids).toBe('3,1');
  });

  it('si el backend está caído, el home no rompe', async () => {
    server.use(http.get(`${API}/products/featured/`, () => HttpResponse.error()));
    await expect(catalog.getFeatured()).resolves.toEqual([]);
  });
});
