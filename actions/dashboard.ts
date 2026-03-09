"use server";

import OrderDB from "@/db/order";
import ProductDB from "@/db/product";
import CustomerDB from "@/db/customer";
import { requireAdminAuth } from "@/services/zauth";

export type DashboardStats = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  activeUsers: number;
  recentOrders: any[];
  dailySales: any[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdminAuth();
  const [orderStats, productCount, customerCount, recentOrders, dailySales] =
    await Promise.all([
      OrderDB.getStats(),
      ProductDB.count(),
      CustomerDB.count(),
      OrderDB.getRecentOrders(5),
      OrderDB.getDailySales(7),
    ]);

  return {
    totalSales: Number(orderStats.totalSales || 0),
    totalOrders: orderStats.total,
    totalProducts: productCount,
    activeUsers: customerCount,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      totalPrice: Number(o.totalPrice),
    })),
    dailySales,
  };
}
