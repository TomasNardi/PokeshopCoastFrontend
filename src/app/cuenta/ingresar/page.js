import { Suspense } from 'react';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Ingresar' };

export default function IngresarPage() {
  return (
    <AuthCard eyebrow="Cuenta" title="Ingresá a tu cuenta" subtitle="Seguí tus pedidos y comprá más rápido.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
