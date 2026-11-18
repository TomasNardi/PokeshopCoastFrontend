import { describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
const { checkDevCredentials } = await import('@/services/site/siteStatus');

describe('checkDevCredentials', () => {
  it('solo entra martin / desarrollo', async () => {
    expect(await checkDevCredentials('martin', 'desarrollo')).toBe(true);
    expect(await checkDevCredentials(' Martin ', 'desarrollo')).toBe(true);
    expect(await checkDevCredentials('martin', 'otra')).toBe(false);
    expect(await checkDevCredentials('tomi', 'desarrollo')).toBe(false);
    expect(await checkDevCredentials(undefined, undefined)).toBe(false);
  });
});
