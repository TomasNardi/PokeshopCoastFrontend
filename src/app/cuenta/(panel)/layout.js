import AccountShell from '@/components/account/AccountShell';

/** Todas las secciones de "Mi cuenta" comparten la barra lateral y el guard de sesión. */
export default function AccountPanelLayout({ children }) {
  return <AccountShell>{children}</AccountShell>;
}
