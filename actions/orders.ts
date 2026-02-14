"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/db/prisma";
import OrderDB from "@/db/order";

// MOCK: Hardcoded Customer ID for testing "Logged In" state.
const TEST_CUSTOMER_EMAIL = "john.doe@example.com";

export async function createOrder(data: {
  items: any[];
  customerId: string;
  shippingMethodCode: string;
  paymentMethodCode: string;
  shippingCost: number;
  paymentFee: number;
}) {
  // 1. Validate inputs
  if (!data.items || data.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // 2. Calculate Totals (Verify on server if possible, but for now trusting client/re-calc)
  const subtotal = data.items.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );
  const taxTotal = subtotal * 0.05; // 5% tax
  const total = subtotal + data.shippingCost + taxTotal + data.paymentFee;

  // 3. Create Order
  const order = await OrderDB.create({
    customerId: data.customerId,
    subtotal,
    shippingTotal: data.shippingCost,
    taxTotal,
    totalPrice: total,
    items: data.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      title: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      options: item.selectedOptions,
    })),
  });

  // 4. Handle Payment Intent
  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { code: data.paymentMethodCode },
  });

  if (paymentMethod) {
    await prisma.paymentIntent.create({
      data: {
        orderId: order.id,
        paymentMethodId: paymentMethod.id,
        amount: total,
        currency: "AED", // Default currency
        status: "PENDING",
      },
    });
  }

  revalidatePath("/admin/orders");

  return { success: true, orderId: order.id };
}

export async function getOrders() {
  // ... existing getOrders code ...
  // TEMPORARY: Fetching all recent orders to ensure visibility in dev mode
  // regardless of which "customer" created them.
  const { orders } = await OrderDB.list({ limit: 50 });
  // const orders = await OrderDB.findByCustomerEmail(TEST_CUSTOMER_EMAIL);

  // Serializing Decimal to Number/String to avoid passing complex objects to client
  return orders.map((order) => ({
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
}

export async function getOrder(orderId: string) {
  const order = await OrderDB.findById(orderId);
  if (!order) return null;

  return {
    ...order,
    totalPrice: Number(order.totalPrice),
    subtotal: Number(order.subtotal),
    taxTotal: Number(order.taxTotal),
    shippingTotal: Number(order.shippingTotal),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
    // flattened payment info if needed
    paymentMethod: order.paymentIntents?.[0]?.paymentMethod?.name || "Unknown",
  };
}
