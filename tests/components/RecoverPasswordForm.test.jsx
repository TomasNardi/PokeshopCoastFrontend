import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecoverPasswordForm from '@/components/auth/RecoverPasswordForm';
import { createPasswordRecoveryService, RECOVERY_SENT_MESSAGE } from '@/services/auth/passwordRecoveryService';
import { createMockAuthProvider } from '@/services/auth/providers/mockAuthProvider';
import PasswordChecklist from '@/components/auth/PasswordChecklist';

const setup = () => {
  const provider = createMockAuthProvider({ persist: false });
  const service = createPasswordRecoveryService(provider, { origin: () => 'http://localhost:3000' });
  render(<RecoverPasswordForm service={service} />);
  return provider;
};

describe('<RecoverPasswordForm />', () => {
  it('email inválido: muestra el error y no manda nada', async () => {
    const provider = setup();
    await userEvent.type(screen.getByLabelText('Email de tu cuenta'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: 'Mandarme el link' }));
    expect(screen.getByText('Ingresá un email válido.')).toBeInTheDocument();
    expect(provider.sentEmails).toHaveLength(0);
  });

  it('email válido: confirma con el mensaje neutro', async () => {
    const provider = setup();
    await userEvent.type(screen.getByLabelText('Email de tu cuenta'), 'demo@pokeshopcoast.com');
    await userEvent.click(screen.getByRole('button', { name: 'Mandarme el link' }));
    expect(await screen.findByRole('status')).toHaveTextContent(RECOVERY_SENT_MESSAGE);
    expect(provider.sentEmails[0].redirectTo).toBe('http://localhost:3000/cuenta/restablecer');
  });
});

describe('<PasswordChecklist />', () => {
  it('marca en vivo qué reglas se cumplen', () => {
    render(<PasswordChecklist password="Coast" />);
    expect(screen.getByText('Letra mayúscula').parentElement).toHaveTextContent('(cumple)');
    expect(screen.getByText('Número').parentElement).toHaveTextContent('(falta)');
  });
});
