import { describe, expect, it } from 'vitest';
import { createMockCustomerRepository } from '@/services/customer/customerRepository.mock';

describe('"Terminá de configurar tu cuenta" (mock = mismo contrato que el backend)', () => {
  it('marca lo que falta y se completa con los datos reales', async () => {
    const repo = createMockCustomerRepository();
    await repo.syncSession('token');
    let { setup } = await repo.getProfile();
    expect(setup.steps.map((s) => s.key)).toEqual(['name', 'phone', 'address']);
    expect(setup.steps.find((s) => s.key === 'phone').done).toBe(false);

    ({ setup } = await repo.updateProfile({ phone: '2257 55-4759' }));
    expect(setup.is_complete).toBe(true);
  });

  it('"No mostrar más" queda guardado en el perfil', async () => {
    const repo = createMockCustomerRepository();
    await repo.syncSession('token');
    expect((await repo.updateProfile({ setup_dismissed: true })).setup.dismissed).toBe(true);
    expect((await repo.getProfile()).setup.dismissed).toBe(true);
  });
});
