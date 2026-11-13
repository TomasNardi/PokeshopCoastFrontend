export function createMockCustomerRepository() {
  let profile = null;
  const addresses = [];

  return {
    async syncSession(token, { email = 'demo@pokeshopcoast.com' } = {}) {
      profile = profile || { email, first_name: 'Coast', last_name: 'Trainer', phone: '', marketing_opt_in: false };
      return { profile, linked_orders: 0 };
    },
    getProfile: async () => profile,
    async updateProfile(data) {
      profile = { ...profile, ...data };
      return profile;
    },
    getAddresses: async () => addresses,
    async createAddress(data) {
      const address = { id: addresses.length + 1, ...data };
      addresses.push(address);
      return address;
    },
    async deleteAddress(id) {
      const index = addresses.findIndex((a) => a.id === id);
      if (index >= 0) addresses.splice(index, 1);
      return null;
    },
    getOrders: async () => [
      { id: 1001, order_code: 'PSC-1001', status: 'shipped', total: '289000', created_at: '2026-10-20T15:00:00Z', items_count: 1 },
    ],
  };
}
