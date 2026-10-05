import { cookies } from "next/headers";
import OrdersAdminModule from "@/components/OrdersAdminModule";
import PedidosAccessGate from "@/components/PedidosAccessGate";
import {
  getPedidosAccessConfigError,
  isPedidosAccessAuthorized,
  PEDIDOS_ACCESS_COOKIE,
} from "@/lib/pedidosAccess";

export default async function PedidosPage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(PEDIDOS_ACCESS_COOKIE)?.value;
  const configError = getPedidosAccessConfigError();
  const initialUnlocked = isPedidosAccessAuthorized(accessCookie);

  return (
    <PedidosAccessGate initialUnlocked={initialUnlocked} configError={configError}>
      <OrdersAdminModule />
    </PedidosAccessGate>
  );
}

