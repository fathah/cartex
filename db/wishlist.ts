import prisma from "./prisma";
import { resolveCurrentMarket } from "@/lib/market";

export default class WishlistDB {
  static async create(customerId: string, productId: string) {
    return await prisma.wishlist.create({
      data: {
        customerId,
        productId,
      },
    });
  }

  static async delete(customerId: string, productId: string) {
    return await prisma.wishlist.deleteMany({
      where: {
        customerId,
        productId,
      },
    });
  }

  static async findByCustomer(customerId: string) {
    const market = await resolveCurrentMarket();
    return await prisma.wishlist.findMany({
      where: {
        customerId,
      },
      include: {
        product: {
          include: {
            mediaProducts: {
              include: {
                media: true,
              },
              take: 1,
            },
            variants: {
              orderBy: {
                createdAt: "asc",
              },
              include: {
                selectedOptions: true,
                inventory: true,
                ...(market?.id
                  ? {
                      variantMarkets: {
                        where: { marketId: market.id },
                        take: 1,
                        include: { market: true },
                      },
                    }
                  : {}),
              },
            },
            collections: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async exists(customerId: string, productId: string) {
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        customerId,
        productId,
      },
    });
    return !!wishlist;
  }

  static async count(customerId: string) {
    return await prisma.wishlist.count({
      where: {
        customerId,
      },
    });
  }
}
