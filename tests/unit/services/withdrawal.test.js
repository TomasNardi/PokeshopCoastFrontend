import { describe, expect, it } from 'vitest';
import { createEngagementService, validateWithdrawal } from '@/services/engagement/engagementService';

describe('botón de arrepentimiento', () => {
  it('pide nombre, email de la compra y un código de pedido válido', () => {
    expect(Object.keys(validateWithdrawal({}))).toEqual(['name', 'email', 'order_code']);
    expect(validateWithdrawal({ name: 'Misty', email: 'm@coast.com', order_code: 'PSC-AB12CD' })).toEqual({});
  });

  it('manda el código en mayúsculas y devuelve el código de trámite', async () => {
    let sent;
    const service = createEngagementService({ sendWithdrawal: async (data) => { sent = data; return { code: 'ARR-ABC234' }; } });
    const res = await service.sendWithdrawal({ name: ' Misty ', email: 'm@coast.com', order_code: 'psc-ab12cd' });
    expect(sent).toMatchObject({ name: 'Misty', order_code: 'PSC-AB12CD', phone: '', reason: '' });
    expect(res.code).toBe('ARR-ABC234');
  });

  it('con datos inválidos no llama a la API', async () => {
    const service = createEngagementService({ sendWithdrawal: async () => { throw new Error('no debería llamarse'); } });
    await expect(service.sendWithdrawal({ name: '', email: 'x', order_code: '1' })).rejects.toMatchObject({ fieldErrors: expect.any(Object) });
  });
});
