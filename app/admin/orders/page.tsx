import { getAdminOrders, getOrderStats } from "@/actions/admin-orders";
import OrderList from "./order-list";

export const dynamic = "force-dynamic";

const OrdersIndex = async () => {
  const [{ orders, total }, stats] = await Promise.all([
    getAdminOrders(),
    getOrderStats(),
  ]);

  return (
    <OrderList initialOrders={orders} initialTotal={total} stats={stats} />
  );
};

export default OrdersIndex;
