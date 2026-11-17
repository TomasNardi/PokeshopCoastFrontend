/**
 * Cuenta del comprador (`/api/v1/customers/...` en Django, igual que Crack).
 *
 * El token de Supabase viaja en `X-Customer-Token`, NO en Authorization: ese
 * header ya lo usa el JWT del staff, y mezclarlos hace que el backend rechace
 * la compra de un cliente logueado.
 */
export const CUSTOMER_TOKEN_HEADER = 'X-Customer-Token';

/**
 * @param {ReturnType<import('../http/httpClient').createHttpClient>} http
 * @param {{ getCustomerToken: () => Promise<string|null> }} deps
 */
export function createHttpCustomerRepository(http, { getCustomerToken = async () => null } = {}) {
  const withToken = async (token) => {
    const value = token ?? (await getCustomerToken());
    return value ? { [CUSTOMER_TOKEN_HEADER]: value } : {};
  };

  return {
    /** Crea la cuenta si es nueva y vincula compras hechas como invitado. */
    syncSession: async (token, { marketingOptIn = false } = {}) =>
      http.post('/customers/session/', { marketing_opt_in: marketingOptIn }, { headers: await withToken(token) }),
    getProfile: async () => http.get('/customers/profile/', { headers: await withToken() }),
    updateProfile: async (data) => http.patch('/customers/profile/', data, { headers: await withToken() }),
    getAddresses: async () => http.get('/customers/addresses/', { headers: await withToken() }),
    createAddress: async (data) => http.post('/customers/addresses/', data, { headers: await withToken() }),
    updateAddress: async (id, data) => http.patch(`/customers/addresses/${id}/`, data, { headers: await withToken() }),
    deleteAddress: async (id) => http.delete(`/customers/addresses/${id}/`, { headers: await withToken() }),
    getOrders: async () => http.get('/customers/orders/', { headers: await withToken(), cache: 'no-store' }),
    getOrder: async (code) => http.get(`/customers/orders/${encodeURIComponent(code)}/`, { headers: await withToken(), cache: 'no-store' }),
    /** Bandeja in-app: { unread, results: [{ id, title, body, url, read_at, created_at }] } */
    getNotifications: async () => http.get('/notifications/', { headers: await withToken(), cache: 'no-store' }),
    /** Sin ids marca todas como leídas. */
    markNotificationsRead: async (ids) => http.post('/notifications/read/', ids ? { ids } : {}, { headers: await withToken() }),
  };
}
