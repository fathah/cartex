import prisma from "@/db/prisma";
import { Order, OrderItem } from "@prisma/client";

export type OrderItemWithImage = OrderItem & { image?: string | null };
export type OrderWithItems = Order & { items: OrderItemWithImage[] };

const OrderDB = {
  findByCustomerEmail: async (email: string): Promise<OrderWithItems[]> => {
    const orders = await prisma.order.findMany({
      where: {
        customer: {
          email: email,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Enrich items with images (since OrderItem doesn't have direct relation to Media/Product in schema)
    // We will look up Product media using productId
    const productIds = Array.from(
      new Set(
        orders.flatMap((o) => o.items.map((i) => i.productId)).filter(Boolean),
      ),
    ) as string[];

    const productsMap = new Map();
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { mediaProducts: { include: { media: true } } },
      });
      products.forEach((p) => {
        productsMap.set(p.id, p);
      });
    }

    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        let imageUrl = null;
        if (item.productId && productsMap.has(item.productId)) {
          const p = productsMap.get(item.productId);
          if (p.mediaProducts?.length > 0) {
            imageUrl = p.mediaProducts[0].media?.url;
          }
        }
        return { ...item, image: imageUrl };
      }),
    }));
  },

  findById: async (id: string) => {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        paymentIntents: {
          include: {
            paymentMethod: true,
          },
        },
        customer: true,
      },
    });

    if (!order) return null;

    // Enrich items with images
    const productIds = order.items
      .map((i) => i.productId)
      .filter(Boolean) as string[];
    const productsMap = new Map();

    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { mediaProducts: { include: { media: true } } },
      });
      products.forEach((p) => productsMap.set(p.id, p));
    }

    return {
      ...order,
      items: order.items.map((item) => {
        let imageUrl = null;
        if (item.productId && productsMap.has(item.productId)) {
          const p = productsMap.get(item.productId);
          if (p.mediaProducts?.length > 0)
            imageUrl = p.mediaProducts[0].media?.url;
        }
        return { ...item, image: imageUrl };
      }),
    };
  },

  list: async ({ page = 1, limit = 10, search = "" } = {}) => {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      // Simple search by order number or customer name
      const searchNum = parseInt(search);
      if (!isNaN(searchNum)) {
        where.orderNumber = searchNum;
      }
      // Could extend to customer name search if joined
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { customer: true, items: true },
      }),
      prisma.order.count({ where }),
    ]);

    // Enrich items with images
    const productIds = Array.from(
      new Set(
        orders.flatMap((o) => o.items.map((i) => i.productId)).filter(Boolean),
      ),
    ) as string[];

    const productsMap = new Map();
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { mediaProducts: { include: { media: true } } },
      });
      products.forEach((p) => {
        productsMap.set(p.id, p);
      });
    }

    const enrichedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        let imageUrl = null;
        if (item.productId && productsMap.has(item.productId)) {
          const p = productsMap.get(item.productId);
          if (p.mediaProducts?.length > 0) {
            imageUrl = p.mediaProducts[0].media?.url;
          }
        }
        return { ...item, image: imageUrl };
      }),
    }));

    return { orders: enrichedOrders, total };
  },

  getStats: async () => {
    const [total, fulfilled, unpaid, returns, totalSalesResult] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { fulfillmentStatus: "FULFILLED" } }),
        prisma.order.count({ where: { paymentStatus: "PENDING" } }), // Assuming PENDING is unpaid
        // No explicit return status in enum, using CANCELLED for approximation or 0
        prisma.order.count({ where: { status: "REFUNDED" } }),
        prisma.order.aggregate({
          _sum: {
            totalPrice: true,
          },
          where: {
            paymentStatus: "PAID",
          },
        }),
      ]);

    return {
      total,
      fulfilled,
      unpaid,
      returns,
      totalSales: totalSalesResult._sum.totalPrice || 0,
    };
  },

  create: async (data: {
    customerId: string;
    subtotal: number;
    shippingTotal: number;
    taxTotal: number;
    totalPrice: number;
    items: {
      productId?: string;
      variantId?: string;
      title: string;
      quantity: number;
      price: number;
      options?: any;
    }[];
  }) => {
    return await prisma.order.create({
      data: {
        customerId: data.customerId,
        subtotal: data.subtotal,
        shippingTotal: data.shippingTotal,
        taxTotal: data.taxTotal,
        totalPrice: data.totalPrice,
        status: "PENDING",
        paymentStatus: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            options: item.options,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  },
};

export default OrderDB;
