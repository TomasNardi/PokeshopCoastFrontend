import AuthCard from '@/components/auth/AuthCard';
import RecoverPasswordForm from '@/components/auth/RecoverPasswordForm';

export const metadata = { title: 'Recuperar contraseña' };

export default function RecuperarPage() {
  return (
    <AuthCard eyebrow="Recuperar acceso" title="¿Olvidaste tu contraseña?" subtitle="Te mandamos un link por email para crear una nueva.">
      <RecoverPasswordForm />
    </AuthCard>
  );
}
