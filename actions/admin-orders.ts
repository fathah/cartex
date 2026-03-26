"use server";

import OrderDB from "@/db/order";
import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";
import { resolveCurrentMarket } from "@/lib/market";
import { InventoryPolicy } from "@prisma/client";
import { PAYMENT_STATUS } from "@/constants/commerce";

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
  if (!market) {
    throw new Error("No active market configured");
  }

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
          inventory: true,
          variantMarkets: {
            where: { marketId: market.id },
            take: 1,
          },
        },
      });

      if (!variant) throw new Error(`Variant ${item.variantId} not found`);

      const marketVariant = Array.isArray(variant.variantMarkets)
        ? variant.variantMarkets[0]
        : null;

      if (!marketVariant || !marketVariant.isAvailable || !marketVariant.isPublished) {
        throw new Error(`${variant.product.name} is not available in ${market.name}`);
      }

      if (item.quantity < marketVariant.minOrderQty) {
        throw new Error(`Minimum quantity not met for ${variant.product.name}`);
      }

      if (
        marketVariant.maxOrderQty !== null &&
        item.quantity > marketVariant.maxOrderQty
      ) {
        throw new Error(`Maximum quantity exceeded for ${variant.product.name}`);
      }

      if (variant.inventoryPolicy === InventoryPolicy.DENY) {
        if (marketVariant.inventoryQuantity < item.quantity) {
          throw new Error(`Insufficient inventory for ${variant.product.name}`);
        }
      }

      const price = Number(marketVariant.salePrice || variant.salePrice || 0);
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
      if (variant.inventoryPolicy === InventoryPolicy.DENY) {
        const updatedMarketInventory = await tx.variantMarket.updateMany({
          where: {
            id: marketVariant.id,
            inventoryQuantity: { gte: item.quantity },
            isAvailable: true,
            isPublished: true,
          },
          data: { inventoryQuantity: { decrement: item.quantity } },
        });
        if (updatedMarketInventory.count === 0) {
          throw new Error(`Insufficient inventory for ${variant.product.name}`);
        }
      } else if (variant.inventory) {
        await tx.inventory.update({
          where: { variantId: variant.id },
          data: { quantity: { decrement: item.quantity } },
        });
      } else {
        await tx.inventory.create({
          data: {
            quantity: -item.quantity,
            variantId: variant.id,
          },
        })
      }
    }

    // 4. Create Order
    const order = await tx.order.create({
      data: {
        customerId: customerId!,
        subtotal: subtotal,
        currency: market.currencyCode || "USD",
        totalPrice: subtotal, // Simplification: No tax/shipping for admin manual orders for now unless specified
        taxTotal: 0,
        shippingTotal: 0,
        marketId: market.id,
        marketCode: market.code,
        marketCountryCode: market.countryCode,
        status: "ORDERED",
        paymentStatus: PAYMENT_STATUS.PENDING,
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
