/**
 * Cuenta del comprador en memoria (solo tests).
 * Misma forma que /api/v1/customers/* y /api/v1/notifications/ de Django,
 * con un historial de demo para maquetar el panel sin backend.
 */
const img = (set, number) => `https://images.pokemontcg.io/${set}/${number}_hires.png`;
const ago = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString();

const item = (name, slug, image, price, quantity = 1) => ({
  product_name: name,
  product_slug: slug,
  image_url: image,
  list_price: String(price),
  unit_price: String(price),
  quantity,
  line_total: String(price * quantity),
});

const DEMO_ORDERS = [
  {
    order_code: 'PSC-TOMI02', status: 'awaiting_transfer', status_label: 'Esperando transferencia', payment_method: 'transfer', created_at: ago(3),
    items: [item('Booster Box Pokémon 151 (Japonés)', 'booster-box-151-japones', '/products/booster-box-151-jp.webp', 245000)],
    shipping_cost: '6500', shipping: { type: 'home', method: 'branch_normal', method_label: 'Sucursal de correo', address: 'Av. Colón 1234, 3° B', city: 'Mar del Plata', province: 'Buenos Aires', zip: '7600' },
    transfer: { bank: 'Banco de prueba', holder: 'PokeShop Coast', cbu: '0000003100000000000000', alias: 'POKESHOP.COAST' },
    timeline: [{ message: 'Pedido recibido (Transferencia bancaria).', at: ago(3) }],
  },
  {
    order_code: 'PSC-TOMI01', status: 'shipped', status_label: 'Enviada', payment_method: 'mercadopago', created_at: ago(51),
    items: [
      item('Charizard ex 199/165 — Scarlet & Violet 151', 'charizard-ex-199-151', img('sv3pt5', '199'), 289000),
      item('Pikachu 025/165 — Scarlet & Violet 151', 'pikachu-025-151-reverse', img('sv3pt5', '25'), 6500),
    ],
    shipping_cost: '8500', shipping: { type: 'home', method: 'home', method_label: 'Envío a domicilio', address: 'Av. Colón 1234, 3° B', city: 'Mar del Plata', province: 'Buenos Aires', zip: '7600' },
    tracking: { carrier: 'Correo Argentino', code: 'CP123456789AR', url: 'https://www.correoargentino.com.ar/formularios/e-commerce?id=CP123456789AR' },
    timeline: [
      { message: 'Pedido recibido (Mercado Pago).', at: ago(51) },
      { message: 'Pago aprobado por Mercado Pago.', at: ago(50.9) },
      { message: 'Despachamos tu pedido.', at: ago(31) },
    ],
  },
  {
    order_code: 'PSC-TOMI03', status: 'ready_for_pickup', status_label: 'Lista para retirar', payment_method: 'transfer', created_at: ago(147),
    items: [item('Umbreon VMAX 215/203 — Evolving Skies', 'umbreon-vmax-215-evolving-skies-psa-10', img('swsh7', '215'), 2150000)],
    shipping_cost: '0', shipping: { type: 'pickup', method: 'pickup_store', method_label: 'Retiro en persona', branch: 'Punto de retiro PokeShop Coast' },
    timeline: [
      { message: 'Pedido recibido (Transferencia bancaria).', at: ago(147) },
      { message: 'Recibimos tu pago. ¡Gracias!', at: ago(144) },
      { message: 'Tu pedido está listo para retirar.', at: ago(121) },
    ],
  },
  {
    order_code: 'PSC-TOMI04', status: 'delivered', status_label: 'Entregada', payment_method: 'mercadopago', created_at: ago(579),
    items: [
      item('Lugia 9/111 — Neo Genesis · Firmada', 'lugia-009-neo-genesis-1st-edition', img('neo1', '9'), 1650000),
      item('Sleeves Coast Sunset x100', 'sleeves-coast-sunset-x100', '/mock/sleeves.svg', 9800),
    ],
    shipping_cost: '8500', shipping: { type: 'home', method: 'home', method_label: 'Envío a domicilio', address: 'Av. Colón 1234, 3° B', city: 'Mar del Plata', province: 'Buenos Aires', zip: '7600' },
    tracking: { carrier: 'Andreani', code: '360000123456789', url: 'https://www.andreani.com/#!/informacionEnvio/360000123456789' },
    timeline: [
      { message: 'Pedido recibido (Mercado Pago).', at: ago(579) },
      { message: 'Pago aprobado por Mercado Pago.', at: ago(578.9) },
      { message: 'Despachamos tu pedido.', at: ago(549) },
      { message: 'Pedido entregado. ¡Que lo disfrutes!', at: ago(479) },
    ],
  },
  {
    order_code: 'PSC-TOMI05', status: 'rejected', status_label: 'Comprobante rechazado', payment_method: 'transfer', created_at: ago(963),
    items: [item('Elite Trainer Box — Paldean Fates', 'elite-trainer-box-paldean-fates', '/products/etb-paldean-fates.webp', 132000)],
    shipping_cost: '9500', shipping: { type: 'home', method: 'branch_express', method_label: 'Sucursal de correo — Express', address: 'San Martín 2650', city: 'Mar del Plata', province: 'Buenos Aires', zip: '7600' },
    rejection_reason: 'El monto del comprobante no coincide con el total del pedido.',
    timeline: [
      { message: 'Pedido recibido (Transferencia bancaria).', at: ago(963) },
      { message: 'El comprobante no pudo validarse: el monto no coincide con el total.', at: ago(958) },
    ],
  },
].map((order, index) => {
  const subtotal = order.items.reduce((sum, i) => sum + Number(i.line_total), 0);
  return {
    id: 1000 + index,
    discount_code: '',
    discount_amount: '0',
    surcharge_amount: '0',
    tracking: null,
    transfer: null,
    rejection_reason: '',
    ...order,
    subtotal: String(subtotal),
    total: String(subtotal + Number(order.shipping_cost)),
    items_count: order.items.reduce((n, i) => n + i.quantity, 0),
  };
});

const DEMO_NOTIFICATIONS = [
  { id: 6, event: 'order_placed_transfer', title: '¡Recibimos tu pedido!', body: 'Ya tenemos tu comprobante. Lo revisamos y te avisamos apenas confirmemos el pago.', url: '/cuenta/pedidos/PSC-TOMI02', read_at: null, created_at: ago(0.2) },
  { id: 5, event: 'order_shipped', title: '¡Va en camino!', body: 'Despachamos tu pedido. Seguilo con el código CP123456789AR.', url: '/cuenta/pedidos/PSC-TOMI01', read_at: null, created_at: ago(28) },
  { id: 4, event: 'order_ready_for_pickup', title: 'Listo para retirar', body: 'Coordinemos día y horario por WhatsApp.', url: '/cuenta/pedidos/PSC-TOMI03', read_at: null, created_at: ago(118) },
  { id: 3, event: 'order_paid', title: '¡Pago confirmado!', body: 'Ya estamos preparando tu pedido.', url: '/cuenta/pedidos/PSC-TOMI01', read_at: ago(40), created_at: ago(47) },
  { id: 2, event: 'order_delivered', title: 'Pedido entregado', body: '¡Que lo disfrutes! Gracias por comprar en PokeShop Coast.', url: '/cuenta/pedidos/PSC-TOMI04', read_at: ago(400), created_at: ago(476) },
  { id: 1, event: 'order_transfer_rejected', title: 'Revisemos tu pago', body: 'No pudimos validar el comprobante. Escribinos y lo resolvemos.', url: '/cuenta/pedidos/PSC-TOMI05', read_at: ago(900), created_at: ago(955) },
];

const DEMO_ADDRESSES = [
  { id: 1, kind: 'home', label: 'Casa', recipient_name: 'Tomi Coast', phone: '223 555-0101', address: 'Av. Colón 1234, 3° B', city: 'Mar del Plata', province: 'Buenos Aires', zip_code: '7600', branch_name: '', is_default: true },
  { id: 2, kind: 'branch', label: 'Correo del centro', recipient_name: 'Tomi Coast', phone: '', address: 'San Martín 2650', city: 'Mar del Plata', province: 'Buenos Aires', zip_code: '7600', branch_name: 'Correo Argentino — Sucursal Centro', is_default: true },
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const summary = ({ id, order_code, status, status_label, total, payment_method, created_at, items_count }) =>
  ({ id, order_code, status, status_label, total, payment_method, created_at, items_count });

/** Mismo cálculo que Customer.setup_status() del backend. */
const withSetup = (profile, addresses) => {
  if (!profile) return profile;
  const done = {
    name: Boolean(profile.first_name?.trim() && profile.last_name?.trim()),
    phone: Boolean(profile.phone?.trim()),
    address: addresses.length > 0,
  };
  const completed = Object.values(done).filter(Boolean).length;
  return {
    ...profile,
    setup: {
      steps: ['name', 'phone', 'address'].map((key) => ({ key, done: done[key] })),
      completed,
      total: 3,
      is_complete: completed === 3,
      dismissed: Boolean(profile.setup_dismissed_at),
    },
  };
};

export function createMockCustomerRepository() {
  let profile = null;
  const addresses = clone(DEMO_ADDRESSES);
  const notifications = clone(DEMO_NOTIFICATIONS);
  let nextAddressId = addresses.length + 1;

  const applyDefault = (address) => {
    if (!address.is_default) return;
    addresses.forEach((a) => {
      if (a.id !== address.id && a.kind === address.kind) a.is_default = false;
    });
  };

  return {
    async syncSession(token, { email = 'demo@pokeshopcoast.com' } = {}) {
      profile = profile || { email, first_name: 'Tomi', last_name: 'Coast', full_name: 'Tomi Coast', phone: '', marketing_opt_in: false, provider: 'email', created_at: ago(2000) };
      return { profile, linked_orders: 0 };
    },
    getProfile: async () => withSetup(profile, addresses),
    async updateProfile({ setup_dismissed: dismissed, ...data }) {
      profile = { ...profile, ...data, full_name: [data.first_name ?? profile.first_name, data.last_name ?? profile.last_name].filter(Boolean).join(' ') };
      if (dismissed !== undefined) profile.setup_dismissed_at = dismissed ? new Date().toISOString() : null;
      return withSetup(profile, addresses);
    },
    getAddresses: async () => clone(addresses),
    async createAddress(data) {
      const address = { id: nextAddressId++, label: '', recipient_name: '', phone: '', branch_name: '', ...data };
      if (!addresses.some((a) => a.kind === address.kind && a.is_default)) address.is_default = true;
      addresses.push(address);
      applyDefault(address);
      return clone(address);
    },
    async updateAddress(id, data) {
      const address = addresses.find((a) => a.id === id);
      Object.assign(address, data);
      applyDefault(address);
      return clone(address);
    },
    async deleteAddress(id) {
      const index = addresses.findIndex((a) => a.id === id);
      if (index >= 0) addresses.splice(index, 1);
      return null;
    },
    getOrders: async () => DEMO_ORDERS.map(summary),
    async getOrder(code) {
      const order = DEMO_ORDERS.find((o) => o.order_code === code);
      if (!order) throw Object.assign(new Error('No encontramos ese pedido.'), { status: 404 });
      return clone(order);
    },
    getNotifications: async () => ({ unread: notifications.filter((n) => !n.read_at).length, results: clone(notifications) }),
    async markNotificationsRead(ids) {
      const now = new Date().toISOString();
      let updated = 0;
      notifications.forEach((n) => {
        if (!n.read_at && (!ids || ids.includes(n.id))) {
          n.read_at = now;
          updated += 1;
        }
      });
      return { updated };
    },
  };
}
