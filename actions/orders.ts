"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/db/prisma";
import { getCurrentUser } from "./user";
import SettingsDB from "@/db/settings";
import { ShippingDB } from "@/db/shipping";
import { InventoryPolicy } from "@prisma/client";
import { resolveCurrentMarket } from "@/lib/market";

function calculateShippingForMethod(method: any, subtotal: number): number {
  const activeRates = (method.rates || [])
    .filter((r: any) => r.isActive)
    .sort((a: any, b: any) => a.priority - b.priority);

  let calculatedPrice: number | null = null;

  for (const rate of activeRates) {
    const ratePrice = Number(rate.price);
    const min = rate.minOrderAmount ? Number(rate.minOrderAmount) : null;
    const max = rate.maxOrderAmount ? Number(rate.maxOrderAmount) : null;

    switch (rate.type) {
      case "FLAT":
        if (calculatedPrice === null) {
          calculatedPrice = ratePrice;
        }
        break;
      case "CONDITIONAL":
      case "PRICE": {
        const inMin = min === null || subtotal >= min;
        const inMax = max === null || subtotal <= max;
        if (inMin && inMax) {
          if (calculatedPrice === null || ratePrice < calculatedPrice) {
            calculatedPrice = ratePrice;
          }
        }
        break;
      }
      case "WEIGHT":
        if (calculatedPrice === null) {
          calculatedPrice = ratePrice;
        }
        break;
    }
  }

  if (calculatedPrice === null && activeRates.length > 0) {
    calculatedPrice = Number(activeRates[0].price);
  }

  return calculatedPrice ?? 0;
}

export async function createOrder(data: {
  items: { variantId?: string; quantity: number }[];
  shippingMethodCode: string;
  paymentMethodCode: string;
  shippingAddressId: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  // 1. Validate inputs
  if (!data.items || data.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const variantIds = data.items
    .map((item) => item.variantId)
    .filter(Boolean) as string[];
  if (variantIds.length !== data.items.length) {
    throw new Error("Invalid cart items");
  }

  const address = await prisma.address.findFirst({
    where: {
      id: data.shippingAddressId,
      customerId: user.id,
    },
  });
  if (!address) {
    throw new Error("Shipping address not found");
  }

  const resolvedMarket =
    (address.country &&
      (await prisma.market.findFirst({
        where: {
          isActive: true,
          OR: [
            { code: address.country.toUpperCase() },
            { countryCode: address.country.toUpperCase() },
          ],
        },
      }))) ||
    (await resolveCurrentMarket());

  if (!resolvedMarket) {
    throw new Error("No active market configured");
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      deletedAt: null,
      product: {
        deletedAt: null,
        status: "ACTIVE",
      },
    },
    include: {
      product: true,
      inventory: true,
      variantMarkets: {
        where: { marketId: resolvedMarket.id },
        take: 1,
      },
      selectedOptions: {
        include: {
          option: true,
        },
      },
    },
  });

  const variantsMap = new Map(variants.map((v) => [v.id, v]));
  if (variantsMap.size !== variantIds.length) {
    throw new Error("Some items are no longer available");
  }

  const lineItems = data.items.map((item) => {
    const variant = variantsMap.get(item.variantId as string);
    if (!variant) {
      throw new Error("Invalid cart item");
    }
    if (item.quantity <= 0) {
      throw new Error("Invalid quantity");
    }
    if (
      variant.inventoryPolicy === InventoryPolicy.DENY &&
      (
        variant.variantMarkets.length > 0
          ? (variant.variantMarkets[0]?.inventoryQuantity ?? 0) < item.quantity
          : !variant.inventory || variant.inventory.quantity < item.quantity
      )
    ) {
      throw new Error("Insufficient inventory");
    }
    if (
      variant.variantMarkets.length > 0 &&
      (!variant.variantMarkets[0]?.isAvailable ||
        !variant.variantMarkets[0]?.isPublished)
    ) {
      throw new Error("Some items are not available in your market");
    }

    return {
      variant,
      quantity: item.quantity,
      unitPrice: Number(variant.variantMarkets[0]?.salePrice ?? variant.salePrice),
      options: (variant.selectedOptions || []).map((so: any) => ({
        name: so.option?.name,
        value: so.value,
      })),
    };
  });

  const cartSum = lineItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );

  const settings = await SettingsDB.get();
  const taxRate = settings.taxRate || 0;
  const taxMode = settings.taxMode || "EXCLUSIVE";

  let taxTotal = 0;
  let subtotal = 0; // Net tax-exclusive amount

  if (taxMode === "INCLUSIVE") {
    subtotal = cartSum / (1 + taxRate / 100);
    taxTotal = cartSum - subtotal;
  } else {
    subtotal = cartSum;
    taxTotal = (subtotal * taxRate) / 100;
  }

  const zone = await ShippingDB.findZoneForAddress(
    address.country!,
    address.province || undefined,
    address.city || undefined,
    address.zip || undefined,
  );
  if (!zone) {
    throw new Error("No shipping zone available for address");
  }
  const shippingMethod = zone.methods?.find(
    (m: any) => m.code === data.shippingMethodCode && m.isActive,
  );
  if (!shippingMethod) {
    throw new Error("Invalid shipping method");
  }
  const shippingTotal = calculateShippingForMethod(shippingMethod, subtotal);

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { code: data.paymentMethodCode },
  });
  if (!paymentMethod || !paymentMethod.isActive) {
    throw new Error("Invalid payment method");
  }
  let paymentFee = 0;
  if (paymentMethod.fee && Number(paymentMethod.fee) > 0) {
    if (paymentMethod.feeType === "PERCENTAGE") {
      paymentFee = (subtotal * Number(paymentMethod.fee)) / 100;
    } else {
      paymentFee = Number(paymentMethod.fee);
    }
  }

  const currency = resolvedMarket.currencyCode || settings.currency || "USD";

  const total = subtotal + taxTotal + shippingTotal + paymentFee;

  // 3. Create Order in a transaction and adjust inventory
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerId: user.id,
        currency,
        subtotal,
        shippingTotal,
        taxTotal,
        totalPrice: total,
        shippingAddress: {
          fullName: address.fullname,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          zip: address.zip,
          country: address.country,
          phone: address.phone,
        },
        billingAddress: {
          fullName: address.fullname,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          zip: address.zip,
          country: address.country,
          phone: address.phone,
        },
        items: {
          create: lineItems.map((item) => ({
            productId: item.variant.productId,
            variantId: item.variant.id,
            sku: item.variant.sku || undefined,
            title: item.variant.product.name,
            quantity: item.quantity,
            price: item.unitPrice,
            options: item.options,
          })),
        },
      },
      include: { items: true },
    });

    await tx.paymentIntent.create({
      data: {
        orderId: created.id,
        paymentMethodId: paymentMethod.id,
        amount: total,
        currency,
        status: "PENDING",
      },
    });

    for (const item of lineItems) {
      const marketVariant = item.variant.variantMarkets[0];
      if (marketVariant) {
        await tx.variantMarket.update({
          where: { id: marketVariant.id },
          data: { inventoryQuantity: { decrement: item.quantity } },
        });
      } else if (item.variant.inventory) {
        await tx.inventory.update({
          where: { variantId: item.variant.id },
          data: { quantity: { decrement: item.quantity } },
        });
      } else if (item.variant.inventoryPolicy === InventoryPolicy.CONTINUE) {
        await tx.inventory.create({
          data: {
            variantId: item.variant.id,
            quantity: -item.quantity,
          },
        });
      }
    }

    return created;
  });

  revalidatePath("/admin/orders");

  return { success: true, orderId: order.id };
}

export async function getOrders() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 50,
  });

  const variantIds = orders
    .flatMap((o) => o.items.map((i) => i.variantId))
    .filter(Boolean) as string[];

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      image: true,
      product: {
        include: {
          mediaProducts: {
            take: 1,
            include: {
              media: true,
            },
            orderBy: {
              media: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    },
  });

  const variantsMap = new Map(variants.map((v) => [v.id, v]));

  // Serializing Decimal to Number/String to avoid passing complex objects to client
  return orders.map((order) => ({
    ...order,
    totalPrice: Number(order.totalPrice),
    subtotal: Number(order.subtotal),
    taxTotal: Number(order.taxTotal),
    shippingTotal: Number(order.shippingTotal),
    items: order.items.map((item) => {
      let image: string | null = null;
      if (item.variantId) {
        const variant = variantsMap.get(item.variantId);
        if (variant) {
          if (variant.image?.url) {
            image = variant.image.url;
          } else if (variant.product?.mediaProducts?.[0]?.media?.url) {
            image = variant.product.mediaProducts[0].media.url;
          }
        }
      }

      return {
        ...item,
        price: Number(item.price),
        image,
      };
    }),
  }));
}

export async function getOrder(orderId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: user.id },
    include: {
      items: true,
      paymentIntents: {
        include: {
          paymentMethod: true,
        },
      },
    },
  });
  if (!order) return null;

  const variantIds = order.items
    .map((i) => i.variantId)
    .filter(Boolean) as string[];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      image: true, // Only fetch direct image, keeping it fast for single order
      product: {
        include: {
          mediaProducts: {
            take: 1,
            include: { media: true },
            orderBy: { media: { createdAt: "desc" } },
          },
        },
      },
    },
  });

  const variantsMap = new Map(variants.map((v) => [v.id, v]));

  const { paymentIntents, ...orderData } = order;

  return {
    ...orderData,
    totalPrice: Number(orderData.totalPrice),
    subtotal: Number(orderData.subtotal),
    taxTotal: Number(orderData.taxTotal),
    shippingTotal: Number(orderData.shippingTotal),
    items: orderData.items.map((item) => {
      let image: string | null = null;
      if (item.variantId) {
        const variant = variantsMap.get(item.variantId);
        if (variant) {
          if (variant.image?.url) {
            image = variant.image.url;
          } else if (variant.product?.mediaProducts?.[0]?.media?.url) {
            image = variant.product.mediaProducts[0].media.url;
          }
        }
      }

      return {
        ...item,
        price: Number(item.price),
        image,
      };
    }),
    // flattened payment info if needed
    paymentMethod: paymentIntents?.[0]?.paymentMethod?.name || "Unknown",
  };
}
