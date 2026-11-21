import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from '@/components/auth/SessionProvider';
import { readOrderClaims, rememberOrderClaim } from '@/domain/guestSignup';

function Probe() {
  const { syncVersion, profile } = useSession();
  return <p>sync:{syncVersion} perfil:{profile?.email || '-'}</p>;
}

describe('SessionProvider + pedidos de invitado', () => {
  it('al entrar manda las constancias de este navegador y después las borra', async () => {
    localStorage.clear();
    rememberOrderClaim('constancia-1');
    const syncSession = vi.fn(async () => ({ profile: { email: 'nueva@gmail.com' }, linked_orders: 1 }));
    const services = {
      auth: {
        enabled: true,
        onChange: (cb) => {
          cb('SIGNED_IN', { accessToken: 't', user: { id: 'u1', email: 'nueva@gmail.com' } });
          return () => {};
        },
        signOut: vi.fn(),
      },
      customer: { syncSession },
    };
    render(<SessionProvider services={services}><Probe /></SessionProvider>);
    await waitFor(() => expect(screen.getByText(/sync:1/)).toBeInTheDocument());
    expect(syncSession).toHaveBeenCalledWith('t', expect.objectContaining({ claimTokens: ['constancia-1'] }));
    expect(readOrderClaims()).toEqual([]);
    expect(screen.getByText(/perfil:nueva@gmail.com/)).toBeInTheDocument();
  });
});
