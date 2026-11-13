import AuthCard from '@/components/auth/AuthCard';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = { title: 'Nueva contraseña' };

export default function RestablecerPage() {
  return (
    <AuthCard eyebrow="Recuperar acceso" title="Creá una contraseña nueva">
      <ResetPasswordForm />
    </AuthCard>
  );
}
