"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { InventoryPolicy, Prisma } from "@prisma/client";
import prisma from "@/db/prisma";
import { getCurrentUser } from "./user";
import SettingsDB from "@/db/settings";
import { ShippingDB } from "@/db/shipping";
import { calculatePaymentFee, calculateShippingFromRates, calculateTaxBreakdown } from "@/lib/pricing";
import { PAYMENT_STATUS } from "@/constants/commerce";
import { resolveCurrentMarket } from "@/lib/market";

const createOrderSchema = z.object({
  checkoutRequestId: z.string().trim().min(8),
  items: z
    .array(
      z.object({
        quantity: z.number().int().positive(),
        variantId: z.string().trim().min(1),
      }),
    )
    .min(1),
  paymentMethodCode: z.string().trim().min(1),
  shippingAddressId: z.string().trim().min(1),
  shippingMethodCode: z.string().trim().min(1),
});

function toNumber(
  value: Prisma.Decimal | number | string | null | undefined,
) {
  return Number(value || 0);
}

function resolveLineItemPrice(variant: {
  salePrice: Prisma.Decimal;
  variantMarkets?: Array<{ salePrice: Prisma.Decimal }>;
}) {
  return toNumber(variant.variantMarkets?.[0]?.salePrice ?? variant.salePrice);
}

export async function createOrder(input: {
  checkoutRequestId: string;
  items: { variantId?: string; quantity: number }[];
  shippingMethodCode: string;
  paymentMethodCode: string;
  shippingAddressId: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const data = createOrderSchema.parse({
    ...input,
    items: input.items.map((item) => ({
      quantity: item.quantity,
      variantId: item.variantId,
    })),
  });

  const existingOrder = await prisma.order.findFirst({
    where: {
      checkoutRequestId: data.checkoutRequestId,
      customerId: user.id,
    },
    select: { id: true },
  });
  if (existingOrder) {
    return { success: true, orderId: existingOrder.id };
  }

  const address = await prisma.address.findFirst({
    where: {
      customerId: user.id,
      id: data.shippingAddressId,
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

  const settings = await SettingsDB.get();
  const zone = await ShippingDB.findZoneForAddress(
    address.country || "",
    address.province || undefined,
    address.city || undefined,
    address.zip || undefined,
  );
  if (!zone) {
    throw new Error("No shipping zone available for this address");
  }

  const shippingMethod = zone.methods.find(
    (method: any) => method.code === data.shippingMethodCode && method.isActive,
  );
  if (!shippingMethod) {
    throw new Error("Invalid shipping method");
  }

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      code: data.paymentMethodCode,
      isActive: true,
    },
    include: {
      gateways: {
        where: { isActive: true },
        select: { code: true, id: true },
      },
    },
  });
  if (!paymentMethod) {
    throw new Error("Invalid payment method");
  }

  const currency = resolvedMarket.currencyCode || settings.currency || "USD";

  const order = await prisma.$transaction(async (tx) => {
    const retryOrder = await tx.order.findFirst({
      where: {
        checkoutRequestId: data.checkoutRequestId,
        customerId: user.id,
      },
      select: { id: true },
    });
    if (retryOrder) {
      return retryOrder;
    }

    const variants = await tx.productVariant.findMany({
      where: {
        deletedAt: null,
        id: { in: data.items.map((item) => item.variantId) },
        product: {
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      include: {
        inventory: true,
        product: true,
        selectedOptions: {
          include: { option: true },
        },
        variantMarkets: {
          where: { marketId: resolvedMarket.id },
          take: 1,
        },
      },
    });

    const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
    if (variantsById.size !== data.items.length) {
      throw new Error("Some items are no longer available");
    }

    const lineItems = data.items.map((item) => {
      const variant = variantsById.get(item.variantId);
      if (!variant) {
        throw new Error("Invalid cart item");
      }

      const marketVariant = variant.variantMarkets[0] || null;
      if (marketVariant) {
        if (!marketVariant.isPublished || !marketVariant.isAvailable) {
          throw new Error("Some items are not available in your market");
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
      }

      if (variant.inventoryPolicy === InventoryPolicy.DENY) {
        const availableInventory = marketVariant
          ? marketVariant.inventoryQuantity
          : variant.inventory?.quantity ?? 0;
        if (availableInventory < item.quantity) {
          throw new Error(`Insufficient inventory for ${variant.product.name}`);
        }
      }

      return {
        marketVariant,
        options: variant.selectedOptions.map((selectedOption) => ({
          name: selectedOption.option?.name || "",
          value: selectedOption.value,
        })),
        quantity: item.quantity,
        unitPrice: resolveLineItemPrice(variant),
        variant,
      };
    });

    const cartSum = lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const taxBreakdown = calculateTaxBreakdown({
      cartSum,
      taxMode: settings.taxMode || "EXCLUSIVE",
      taxRate: settings.taxRate || 0,
    });
    const shippingPricing = calculateShippingFromRates(
      shippingMethod.rates || [],
      taxBreakdown.subtotal,
      zone.id,
    );
    const paymentFee = calculatePaymentFee(paymentMethod, taxBreakdown.subtotal);
    const totalPrice =
      taxBreakdown.subtotal +
      taxBreakdown.taxTotal +
      shippingPricing.calculatedPrice +
      paymentFee;

    for (const item of lineItems) {
      if (item.marketVariant) {
        if (item.variant.inventoryPolicy === InventoryPolicy.DENY) {
          const updatedMarketInventory = await tx.variantMarket.updateMany({
            where: {
              id: item.marketVariant.id,
              inventoryQuantity: {
                gte: item.quantity,
              },
              isAvailable: true,
              isPublished: true,
            },
            data: {
              inventoryQuantity: {
                decrement: item.quantity,
              },
            },
          });

          if (updatedMarketInventory.count === 0) {
            throw new Error(`Insufficient inventory for ${item.variant.product.name}`);
          }
        } else {
          await tx.variantMarket.update({
            where: { id: item.marketVariant.id },
            data: {
              inventoryQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        continue;
      }

      if (item.variant.inventoryPolicy === InventoryPolicy.DENY) {
        const updatedInventory = await tx.inventory.updateMany({
          where: {
            variantId: item.variant.id,
            quantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedInventory.count === 0) {
          throw new Error(`Insufficient inventory for ${item.variant.product.name}`);
        }
        continue;
      }

      if (item.variant.inventory) {
        await tx.inventory.update({
          where: { variantId: item.variant.id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      } else {
        await tx.inventory.create({
          data: {
            quantity: -item.quantity,
            variantId: item.variant.id,
          },
        });
      }
    }

    const createdOrder = await tx.order.create({
      data: {
        billingAddress: {
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          country: address.country,
          fullName: address.fullname,
          phone: address.phone,
          province: address.province,
          zip: address.zip,
        },
        checkoutRequestId: data.checkoutRequestId,
        currency,
        customerId: user.id,
        items: {
          create: lineItems.map((item) => ({
            options: item.options,
            price: item.unitPrice,
            productId: item.variant.productId,
            quantity: item.quantity,
            sku: item.variant.sku || undefined,
            title: item.variant.product.name,
            variantId: item.variant.id,
          })),
        },
        marketCode: resolvedMarket.code,
        marketCountryCode: resolvedMarket.countryCode,
        marketId: resolvedMarket.id,
        paymentStatus: PAYMENT_STATUS.PENDING,
        shippingAddress: {
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          country: address.country,
          fullName: address.fullname,
          phone: address.phone,
          province: address.province,
          zip: address.zip,
        },
        shippingTotal: shippingPricing.calculatedPrice,
        subtotal: taxBreakdown.subtotal,
        taxTotal: taxBreakdown.taxTotal,
        totalPrice,
      },
      select: { id: true },
    });

    await tx.paymentIntent.create({
      data: {
        amount: totalPrice,
        currency,
        orderId: createdOrder.id,
        paymentMethodId: paymentMethod.id,
        status: "PENDING",
      },
    });

    return createdOrder;
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
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    where: { customerId: user.id },
  });

  const variantIds = orders
    .flatMap((order) => order.items.map((item) => item.variantId))
    .filter(Boolean) as string[];

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      image: true,
      product: {
        include: {
          mediaProducts: {
            include: {
              media: true,
            },
            orderBy: {
              media: {
                createdAt: "desc",
              },
            },
            take: 1,
          },
        },
      },
    },
  });

  const variantsMap = new Map(variants.map((variant) => [variant.id, variant]));

  return orders.map((order) => ({
    ...order,
    shippingTotal: toNumber(order.shippingTotal),
    subtotal: toNumber(order.subtotal),
    taxTotal: toNumber(order.taxTotal),
    totalPrice: toNumber(order.totalPrice),
    items: order.items.map((item) => {
      let image: string | null = null;

      if (item.variantId) {
        const variant = variantsMap.get(item.variantId);
        if (variant?.image?.url) {
          image = variant.image.url;
        } else if (variant?.product?.mediaProducts?.[0]?.media?.url) {
          image = variant.product.mediaProducts[0].media.url;
        }
      }

      return {
        ...item,
        image,
        price: toNumber(item.price),
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
    include: {
      items: true,
      paymentIntents: {
        include: {
          paymentMethod: true,
        },
      },
    },
    where: { customerId: user.id, id: orderId },
  });
  if (!order) {
    return null;
  }

  const variantIds = order.items
    .map((item) => item.variantId)
    .filter(Boolean) as string[];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      image: true,
      product: {
        include: {
          mediaProducts: {
            include: { media: true },
            orderBy: { media: { createdAt: "desc" } },
            take: 1,
          },
        },
      },
    },
  });

  const variantsMap = new Map(variants.map((variant) => [variant.id, variant]));
  const { paymentIntents, ...orderData } = order;

  return {
    ...orderData,
    paymentMethod: paymentIntents?.[0]?.paymentMethod?.name || "Unknown",
    shippingTotal: toNumber(orderData.shippingTotal),
    subtotal: toNumber(orderData.subtotal),
    taxTotal: toNumber(orderData.taxTotal),
    totalPrice: toNumber(orderData.totalPrice),
    items: orderData.items.map((item) => {
      let image: string | null = null;

      if (item.variantId) {
        const variant = variantsMap.get(item.variantId);
        if (variant?.image?.url) {
          image = variant.image.url;
        } else if (variant?.product?.mediaProducts?.[0]?.media?.url) {
          image = variant.product.mediaProducts[0].media.url;
        }
      }

      return {
        ...item,
        image,
        price: toNumber(item.price),
      };
    }),
  };
}
