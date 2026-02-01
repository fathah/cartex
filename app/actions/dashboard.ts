"use server";

import OrderDB from "@/db/order";
import ProductDB from "@/db/product";
import CustomerDB from "@/db/customer";

export type DashboardStats = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  activeUsers: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [orderStats, productCount, customerCount] = await Promise.all([
    OrderDB.getStats(),
    ProductDB.count(),
    CustomerDB.count(),
  ]);

  return {
    totalSales: Number(orderStats.totalSales || 0),
    totalOrders: orderStats.total,
    totalProducts: productCount,
    activeUsers: customerCount,
  };
}
