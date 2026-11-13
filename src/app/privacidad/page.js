import LegalPage from '@/components/ui/LegalPage';

export const metadata = { title: 'Política de privacidad' };

const SECTIONS = [
  { title: 'Qué datos guardamos', body: 'Nombre, email, teléfono y dirección de envío, solo para procesar tus pedidos. Si ingresás con Google, recibimos tu nombre y email.' },
  { title: 'Pagos', body: 'Los datos de tarjeta los procesa Mercado Pago. Nunca pasan por nuestros servidores.' },
  { title: 'Emails', body: 'Te mandamos emails transaccionales (pedido, envío, recuperación de contraseña). La newsletter es opcional y te podés desuscribir en cualquier momento.' },
  { title: 'Tus derechos', body: 'Podés pedir acceso, corrección o eliminación de tus datos escribiéndonos desde la página de contacto (Ley 25.326).' },
];

export default function Page() {
  return <LegalPage title="Privacidad" sections={SECTIONS} />;
}
