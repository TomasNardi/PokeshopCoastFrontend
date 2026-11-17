import OrderDetail from '@/components/account/OrderDetail';

export async function generateMetadata({ params }) {
  const { code } = await params;
  return { title: `Pedido ${code}` };
}

export default async function PedidoPage({ params }) {
  const { code } = await params;
  return <OrderDetail code={decodeURIComponent(code).toUpperCase()} />;
}
