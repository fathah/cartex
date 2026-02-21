import { getAdminOrders, getOrderStats } from "@/actions/admin-orders";
import OrderList from "./order-list";

export const dynamic = "force-dynamic";

const OrdersIndex = async ({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || "all";

  const [{ orders, total }, stats] = await Promise.all([
    getAdminOrders({ tab: currentTab }),
    getOrderStats(),
  ]);

  return (
    <OrderList
      initialOrders={orders}
      initialTotal={total}
      stats={stats}
      activeTab={currentTab}
    />
  );
};

export default OrdersIndex;
