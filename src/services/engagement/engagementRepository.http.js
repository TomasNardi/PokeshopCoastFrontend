/**
 * Contacto y newsletter (mismos endpoints que Crack). El backend guarda el
 * mensaje y avisa por mail con Resend; el front no conoce la API key.
 */
export function createHttpEngagementRepository(http) {
  return {
    sendContact: (data) => http.post('/contact/', data),
    subscribe: (email) => http.post('/subscribe/', { email }),
    unsubscribe: (token) => http.post('/unsubscribe/', { token }),
    getSiteConfig: () => http.get('/site-config/', { cache: 'no-store' }),
  };
}

export function createMockEngagementRepository() {
  const inbox = [];
  return {
    inbox,
    async sendContact(data) {
      inbox.push(data);
      return { message: 'Recibimos tu mensaje. Te respondemos a la brevedad.' };
    },
    subscribe: async () => ({ message: '¡Listo! Ya sos parte de la comunidad Coast.' }),
    unsubscribe: async () => ({ message: 'Te desuscribimos.' }),
    getSiteConfig: async () => ({ is_active: true, show_top_banner: true, top_banner_message: '' }),
  };
}
