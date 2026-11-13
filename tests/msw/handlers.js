/**
 * Backend Django "falso" para los tests de contrato.
 *
 * Responde con el MISMO shape que la API real de Crack (DRF paginado,
 * errores { detail } / { campo: [msg] }, header X-Customer-Token). Cuando el
 * backend de PokeShop Coast esté arriba, tests/integration corre los mismos
 * escenarios contra el servidor real: si algo difiere, el contrato cambió.
 */
import { http, HttpResponse } from 'msw';
import { MOCK_CATEGORIES, MOCK_CONDITIONS, MOCK_PAYMENT_CONFIG, MOCK_PRODUCTS } from '@/mocks/data/products';
import { filterProducts } from '@/services/catalog/catalogRepository.mock';

export const API = 'http://api.test/api/v1';

/** Lo que el front mandó, para que los tests lo inspeccionen. */
export const received = { orders: [], contacts: [], customerTokens: [] };

export function resetReceived() {
  received.orders.length = 0;
  received.contacts.length = 0;
  received.customerTokens.length = 0;
}

const paginate = (list, page = 1, size = 12) => ({
  count: list.length,
  next: page * size < list.length ? `${API}/products/?page=${page + 1}` : null,
  previous: page > 1 ? `${API}/products/?page=${page - 1}` : null,
  results: list.slice((page - 1) * size, page * size),
});

export const handlers = [
  http.get(`${API}/products/`, ({ request }) => {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    return HttpResponse.json(paginate(filterProducts(MOCK_PRODUCTS, params), Number(params.page) || 1));
  }),
  http.get(`${API}/products/new-arrivals/`, () => HttpResponse.json(MOCK_PRODUCTS.slice(0, 8))),
  http.get(`${API}/products/featured/`, () => HttpResponse.json({ count: 2, results: MOCK_PRODUCTS.filter((p) => p.is_featured) })),
  http.get(`${API}/products/by-ids/`, ({ request }) => {
    const ids = new URL(request.url).searchParams.get('ids').split(',').map(Number);
    return HttpResponse.json(MOCK_PRODUCTS.filter((p) => ids.includes(p.id)));
  }),
  http.get(`${API}/products/:slug/`, ({ params }) => {
    const product = MOCK_PRODUCTS.find((p) => p.slug === params.slug);
    return product ? HttpResponse.json(product) : HttpResponse.json({ detail: 'No encontrado.' }, { status: 404 });
  }),
  http.get(`${API}/categories/`, () => HttpResponse.json(MOCK_CATEGORIES)),
  http.get(`${API}/conditions/`, () => HttpResponse.json({ count: MOCK_CONDITIONS.length, results: MOCK_CONDITIONS })),

  http.get(`${API}/payments/config/`, () => HttpResponse.json(MOCK_PAYMENT_CONFIG)),
  http.post(`${API}/payments/validate-discount/`, async ({ request }) => {
    const { code } = await request.json();
    return code === 'COAST10'
      ? HttpResponse.json({ code, percent: 10, fixed: 0, expires_at: null })
      : HttpResponse.json({ code: ['El código no es válido.'] }, { status: 400 });
  }),
  http.post(`${API}/payments/verify/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ status: 'approved', order: { id: Number(body.external_reference), order_code: 'PSC-1', status: 'paid' } });
  }),

  http.post(`${API}/orders/receipt/`, () => HttpResponse.json({ token: 'rcpt-1', name: 'comprobante.pdf', content_type: 'application/pdf', size: 10 })),
  http.post(`${API}/orders/`, async ({ request }) => {
    const body = await request.json();
    received.orders.push({ body, customerToken: request.headers.get('X-Customer-Token') });
    const outOfStock = body.items.find((i) => MOCK_PRODUCTS.find((p) => p.id === i.product_id)?.in_stock === false);
    if (outOfStock) {
      return HttpResponse.json({ items: [`Producto ${outOfStock.product_id} sin stock.`] }, { status: 400 });
    }
    const order = { id: 1, order_code: 'PSC-1', status: 'pending_payment', customer_email: body.customer_email };
    return HttpResponse.json(
      body.payment_method === 'mercadopago'
        ? { order, checkout: { init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123' } }
        : { order },
      { status: 201 }
    );
  }),

  http.post(`${API}/customers/session/`, ({ request }) => {
    const token = request.headers.get('X-Customer-Token');
    received.customerTokens.push(token);
    if (!token) return HttpResponse.json({ detail: 'Credenciales no provistas.' }, { status: 401 });
    return HttpResponse.json({ profile: { email: 'demo@pokeshopcoast.com', first_name: 'Coast' }, linked_orders: 0 });
  }),
  http.get(`${API}/customers/orders/`, ({ request }) =>
    request.headers.get('X-Customer-Token')
      ? HttpResponse.json([{ id: 1, order_code: 'PSC-1', status: 'paid', total: '1000', created_at: '2026-11-01T00:00:00Z' }])
      : HttpResponse.json({ detail: 'Credenciales no provistas.' }, { status: 401 })
  ),

  http.post(`${API}/contact/`, async ({ request }) => {
    received.contacts.push(await request.json());
    return HttpResponse.json({ message: 'Mensaje recibido.' }, { status: 201 });
  }),
  http.post(`${API}/subscribe/`, () => HttpResponse.json({ message: 'Suscripto.' }, { status: 201 })),
];
