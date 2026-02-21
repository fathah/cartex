"use server";

import OrderDB from "@/db/order";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

export async function getAdminOrders({
  page = 1,
  limit = 10,
  search = "",
  tab = "all",
} = {}) {
  await requireAdminAuth();
  const { orders, total } = await OrderDB.list({ page, limit, search, tab });

  // Serialize Decimal types
  const serializedOrders = orders.map((order) => ({
    ...order,
    totalPrice: Number(order.totalPrice),
    subtotal: Number(order.subtotal),
    taxTotal: Number(order.taxTotal),
    shippingTotal: Number(order.shippingTotal),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));

  return { orders: serializedOrders, total };
}

export async function getOrderStats() {
  await requireAdminAuth();
  return await OrderDB.getStats();
}

export async function updateOrderStatus(id: string, data: any) {
  await requireAdminAuth();
  await OrderDB.update(id, data);
  revalidatePath("/admin/orders");
  return { success: true };
}
