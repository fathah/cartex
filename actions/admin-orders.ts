"use server";

import OrderDB from "@/db/order";
import CustomerDB from "@/db/customer";
import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";
import { resolveCurrentMarket } from "@/lib/market";

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
  const stats = await OrderDB.getStats();
  return {
    ...stats,
    totalSales: Number(stats.totalSales || 0),
  };
}

export async function updateOrderStatus(id: string, data: any) {
  await requireAdminAuth();

  const updateData = { ...data };
  if (updateData.status === "FULFILLED") {
    updateData.fulfillmentStatus = "FULFILLED";
  }

  await OrderDB.update(id, updateData);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function createAdminOrder(data: {
  customerId?: string;
  email?: string;
  items: { variantId: string; quantity: number }[];
}) {
  await requireAdminAuth();
  const market = await resolveCurrentMarket();

  return await prisma.$transaction(async (tx) => {
    let customerId = data.customerId;

    // 1. Find or Create Customer
    if (!customerId) {
      const email = data.email || "guest@cartex.ziqx.cc";
      const existing = await tx.customer.findFirst({ where: { email } });
      if (existing) {
        customerId = existing.id;
      } else {
        const guest = await tx.customer.create({
          data: {
            email,
            fullname:
              email === "guest@cartex.ziqx.cc"
                ? "Guest User"
                : email.split("@")[0],
            isGuest: true,
          },
        });
        customerId = guest.id;
      }
    }

    // 2. Resolve Items and Prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of data.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: true,
          ...(market?.id
            ? {
                variantMarkets: {
                  where: { marketId: market.id },
                  take: 1,
                },
              }
            : {}),
        },
      });

      if (!variant) throw new Error(`Variant ${item.variantId} not found`);

      const marketVariant = Array.isArray(variant.variantMarkets)
        ? variant.variantMarkets[0]
        : null;
      const price = Number(marketVariant?.salePrice || variant.salePrice || 0);
      const availableQuantity = marketVariant?.inventoryQuantity;
      if (
        availableQuantity !== undefined &&
        availableQuantity !== null &&
        availableQuantity < item.quantity
      ) {
        throw new Error(`Insufficient inventory for ${variant.product.name}`);
      }
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        variantId: variant.id,
        productId: variant.productId,
        title: `${variant.product.name} - ${variant.title}`,
        sku: variant.sku,
        quantity: item.quantity,
        price: price,
      });

      // 3. Deduct Inventory
      if (marketVariant) {
        await tx.variantMarket.update({
          where: { id: marketVariant.id },
          data: { inventoryQuantity: { decrement: item.quantity } },
        });
      } else {
        await tx.inventory.update({
          where: { variantId: variant.id },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    // 4. Create Order
    const order = await tx.order.create({
      data: {
        customerId: customerId!,
        subtotal: subtotal,
        currency: market?.currencyCode || "USD",
        totalPrice: subtotal, // Simplification: No tax/shipping for admin manual orders for now unless specified
        taxTotal: 0,
        shippingTotal: 0,
        status: "ORDERED",
        paymentStatus: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        items: {
          create: orderItems,
        },
      },
    });

    revalidatePath("/admin/orders");
    return { success: true, orderId: order.id };
  });
}
