import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDevApiAuthProvider } from '@/services/auth/providers/devApiAuthProvider';
import { createAuthService } from '@/services/auth/authService';
import { createMockCustomerRepository } from '@/services/customer/customerRepository.mock';
import { createServices } from '@/services/container';
import { isActiveOrder, orderStatus, orderSteps, timeAgo } from '@/domain/orders';

describe('login de desarrollo (tomi / tomi)', () => {
  beforeEach(() => localStorage.clear());

  const http = (impl) => ({ post: vi.fn(impl) });

  it('acepta usuario (no email) y guarda la sesión del backend', async () => {
    const client = http(async () => ({ access_token: 'jwt', expires_in: 3600, user: { id: 'dev-tomi', email: 'tomi@pokeshopcoast.dev', name: 'Tomi' } }));
    const auth = createAuthService(createDevApiAuthProvider(client));
    expect(auth.acceptsUsername).toBe(true);
    await auth.signInWithPassword({ email: 'tomi', password: 'tomi' });
    expect(client.post).toHaveBeenCalledWith('/customers/dev-login/', { username: 'tomi', password: 'tomi' });
    expect(await auth.getAccessToken()).toBe('jwt');
  });

  it('credenciales incorrectas → error legible', async () => {
    const auth = createAuthService(createDevApiAuthProvider(http(async () => { throw new Error('Usuario o contraseña incorrectos.'); })));
    await expect(auth.signInWithPassword({ email: 'tomi', password: 'x' })).rejects.toThrow();
    expect(await auth.getAccessToken()).toBeNull();
  });

  it('la sesión sobrevive a una recarga y se borra al salir', async () => {
    const client = http(async () => ({ access_token: 'jwt', expires_in: 3600, user: { id: 'dev-tomi', email: 'e', name: 'Tomi' } }));
    await createDevApiAuthProvider(client).signInWithPassword({ email: 'tomi', password: 'tomi' });
    const reloaded = createDevApiAuthProvider(client);
    expect((await reloaded.getSession()).accessToken).toBe('jwt');
    await reloaded.signOut();
    expect(await createDevApiAuthProvider(client).getSession()).toBeNull();
  });

  it('el composition root solo lo usa con NEXT_PUBLIC_DEV_LOGIN', () => {
    expect(createServices({ useMocks: false, supabase: null, devLogin: true, apiUrl: 'http://x' }).auth.acceptsUsername).toBe(true);
    expect(createServices({ useMocks: false, supabase: null, devLogin: false, apiUrl: 'http://x' }).auth.enabled).toBe(false);
  });
});

describe('estados de pedido', () => {
  it('pasos según la entrega', () => {
    expect(orderSteps('pickup')[2]).toBe('Listo para retirar');
    expect(orderSteps('home')[2]).toBe('En camino');
  });

  it('en curso vs finalizado vs con problemas', () => {
    expect(isActiveOrder({ status: 'shipped' })).toBe(true);
    expect(isActiveOrder({ status: 'delivered' })).toBe(false);
    expect(isActiveOrder({ status: 'rejected' })).toBe(false);
    expect(orderStatus('awaiting_transfer').label).toBe('Revisando tu pago');
  });

  it('tiempo relativo', () => {
    const now = Date.parse('2026-11-17T12:00:00Z');
    expect(timeAgo('2026-11-17T11:55:00Z', now)).toBe('hace 5 min');
    expect(timeAgo('2026-11-17T09:00:00Z', now)).toBe('hace 3 h');
    expect(timeAgo('2026-11-16T10:00:00Z', now)).toBe('ayer');
  });
});

describe('cuenta en modo mock', () => {
  it('bandeja: marcar una y todas como leídas', async () => {
    const repo = createMockCustomerRepository();
    expect((await repo.getNotifications()).unread).toBe(3);
    const [first] = (await repo.getNotifications()).results;
    await repo.markNotificationsRead([first.id]);
    expect((await repo.getNotifications()).unread).toBe(2);
    await repo.markNotificationsRead();
    expect((await repo.getNotifications()).unread).toBe(0);
  });

  it('detalle de pedido con totales coherentes', async () => {
    const repo = createMockCustomerRepository();
    const order = await repo.getOrder('PSC-TOMI01');
    expect(Number(order.total)).toBe(Number(order.subtotal) + Number(order.shipping_cost));
    await expect(repo.getOrder('NOPE')).rejects.toThrow();
  });

  it('una sola dirección predeterminada por tipo', async () => {
    const repo = createMockCustomerRepository();
    const created = await repo.createAddress({ kind: 'home', address: 'x', city: 'y', province: 'CABA', zip_code: '1000', is_default: true });
    const homes = (await repo.getAddresses()).filter((a) => a.kind === 'home');
    expect(homes.filter((a) => a.is_default).map((a) => a.id)).toEqual([created.id]);
  });
});
