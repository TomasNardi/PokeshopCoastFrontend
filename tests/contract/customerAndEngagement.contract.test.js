import { describe, expect, it } from 'vitest';
import { setupMswServer } from '../msw/server';
import { API, received } from '../msw/handlers';
import { createHttpClient } from '@/services/http/httpClient';
import { createHttpCustomerRepository } from '@/services/customer/customerRepository.http';
import { createHttpEngagementRepository } from '@/services/engagement/engagementRepository.http';
import { createEngagementService } from '@/services/engagement/engagementService';

setupMswServer();

const httpClient = createHttpClient({ baseUrl: API });

describe('/customers/* (cuenta del comprador)', () => {
  it('syncSession manda el token recibido explícitamente', async () => {
    const repo = createHttpCustomerRepository(httpClient, { getCustomerToken: async () => 'otro' });
    const res = await repo.syncSession('token-del-login');
    expect(received.customerTokens).toEqual(['token-del-login']);
    expect(res.profile.email).toBe('demo@pokeshopcoast.com');
  });

  it('el resto de los endpoints usan el token vigente del proveedor', async () => {
    const repo = createHttpCustomerRepository(httpClient, { getCustomerToken: async () => 'vigente' });
    expect(await repo.getOrders()).toHaveLength(1);
  });

  it('sin token → 401 con mensaje de sesión vencida', async () => {
    const repo = createHttpCustomerRepository(httpClient);
    await expect(repo.getOrders()).rejects.toMatchObject({ status: 401, message: 'Credenciales no provistas.' });
  });
});

describe('contacto y newsletter', () => {
  const service = createEngagementService(createHttpEngagementRepository(httpClient));

  it('POST /contact/ con el motivo prefijado en el mensaje', async () => {
    await service.sendContact({ name: 'Brock', email: 'brock@coast.com', subject: 'venta', message: 'Quiero vender mi colección de Base Set.' });
    expect(received.contacts[0]).toEqual({
      name: 'Brock',
      email: 'brock@coast.com',
      phone: '',
      message: '[Quiero vender mis cartas] Quiero vender mi colección de Base Set.',
    });
  });

  it('valida antes de mandar', async () => {
    await expect(service.sendContact({ name: '', email: 'x', message: 'corto' })).rejects.toMatchObject({
      fieldErrors: { name: expect.any(String), email: expect.any(String), message: expect.any(String) },
    });
    expect(received.contacts).toHaveLength(0);
  });

  it('suscribe a la newsletter', async () => {
    await expect(service.subscribe('misty@coast.com')).resolves.toMatchObject({ message: 'Suscripto.' });
  });
});
