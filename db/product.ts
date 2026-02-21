import prisma from "./prisma";
import { ProductStatus, Prisma } from "@prisma/client";

export type CreateProductData = {
  name: string;
  description?: string;
  status?: ProductStatus;
  slug: string;
  seoTitle?: string;
  seoDesc?: string;
  originalPrice?: number; // Optional initial price
  salePrice?: number; // Optional initial price
  productBrandId?: string;
};

export default class ProductDB {
  static async create(data: CreateProductData) {
    const { originalPrice, salePrice, ...productData } = data;

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: productData,
      });

      // Create default variant
      await tx.productVariant.create({
        data: {
          productId: product.id,
          title: "Default Variant",
          originalPrice: originalPrice || 0,
          salePrice: salePrice || originalPrice || 0,
          sku: "", // Generate or empty
        },
      });

      return product;
    });
  }

  static async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        options: {
          include: { values: true },
          orderBy: { position: "asc" },
        },
        variants: {
          include: {
            selectedOptions: true,
            inventory: true,
          },
        },
        collections: true,
        mediaProducts: {
          include: { media: true },
        },
        brand: true,
      },
    });
  }

  static async findBySlug(slug: string) {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        options: {
          include: { values: true },
          orderBy: { position: "asc" },
        },
        variants: {
          include: {
            selectedOptions: true,
            inventory: true,
          },
        },
        collections: true,
        mediaProducts: {
          include: { media: true },
        },
        brand: true,
      },
    });
  }

  static async list(page = 1, limit = 20, status?: ProductStatus) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(status && { status }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            take: 1,
            include: { inventory: true },
          },
          mediaProducts: {
            take: 1,
            include: { media: true },
          },
          collections: {
            take: 1,
          },
          brand: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, totalPages: Math.ceil(total / limit) };
  }

  static async listDeals(page = 1, limit = 20, status?: ProductStatus) {
    const skip = (page - 1) * limit;

    // Prisma doesn't natively support comparing two columns inside the same relational table easily via 'where'.
    // We fetch all active products, then filter them by JS math where salePrice > 0 and salePrice < originalPrice

    // First retrieve the matching base products
    const rawProducts = await prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(status && { status }),
      },
      include: {
        variants: {
          include: { inventory: true },
        },
        mediaProducts: {
          take: 1,
          include: { media: true },
        },
        collections: {
          take: 1,
        },
        brand: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter in JS for the "deal" condition on the primary variant
    let deals = rawProducts.filter((p) => {
      if (!p.variants || p.variants.length === 0) return false;
      const v = p.variants[0];
      const sale = Number(v.salePrice) || 0;
      const orig = Number(v.originalPrice) || 0;
      return sale > 0 && sale < orig;
    });

    // Sort by salePrice ascending
    deals.sort((a, b) => {
      const saleA = Number(a.variants[0].salePrice) || 0;
      const saleB = Number(b.variants[0].salePrice) || 0;
      return saleA - saleB;
    });

    const total = deals.length;

    // Manual pagination
    deals = deals.slice(skip, skip + limit);

    return { products: deals, total, totalPages: Math.ceil(total / limit) };
  }

  static async listByBrandId(
    brandId: string,
    page = 1,
    limit = 20,
    status?: ProductStatus,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      productBrandId: brandId,
      ...(status && { status }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            take: 1,
            include: { inventory: true },
          },
          mediaProducts: {
            take: 1,
            include: { media: true },
          },
          collections: {
            take: 1,
          },
          brand: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, totalPages: Math.ceil(total / limit) };
  }

  static async update(id: string, data: Prisma.ProductUpdateInput) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    // Soft delete
    return await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async addOption(productId: string, name: string, values: string[]) {
    return await prisma.$transaction(async (tx) => {
      const option = await tx.option.create({
        data: {
          productId,
          name,
          values: {
            create: values.map((v) => ({ value: v })),
          },
        },
        include: { values: true },
      });
      return option;
    });
  }

  static async generateVariants(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        options: { include: { values: true } },
        variants: { include: { selectedOptions: true } },
      },
    });

    if (!product || !product.options.length) return;

    // Cartesian product of options
    const options = product.options;
    const generateCombinations = (index: number, current: any[]): any[][] => {
      if (index === options.length) return [current];
      const result = [];
      for (const value of options[index].values) {
        result.push(...generateCombinations(index + 1, [...current, value]));
      }
      return result;
    };

    const combinations = generateCombinations(0, []);

    // Create variants for each combination
    for (const combo of combinations) {
      // Title = join values
      const title = combo.map((c) => c.value).join(" / ");

      // Check if variant with this title exists
      const existing = product.variants.find(
        (v) => v.title === title && v.deletedAt === null,
      );

      if (!existing) {
        await prisma.productVariant.create({
          data: {
            productId,
            title,
            originalPrice: 0,
            salePrice: 0,
            selectedOptions: {
              connect: combo.map((c) => ({ id: c.id })),
            },
          },
        });
      }
    }
  }
  static async updateVariant(
    variantId: string,
    data: {
      originalPrice: number;
      salePrice: number;
      sku?: string;
      inventory: number;
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // Update variant details
      const variant = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          originalPrice: data.originalPrice,
          salePrice: data.salePrice,
          sku: data.sku,
        },
      });

      // Update inventory
      await tx.inventory.upsert({
        where: { variantId },
        create: { variantId, quantity: data.inventory },
        update: { quantity: data.inventory },
      });

      return variant;
    });
  }
  static async addMedia(
    productId: string,
    url: string,
    type: "IMAGE" | "VIDEO" = "IMAGE",
  ) {
    return await prisma.$transaction(async (tx) => {
      const media = await tx.media.create({
        data: {
          url,
          type,
        },
      });

      await tx.mediaProduct.create({
        data: {
          productId,
          mediaId: media.id,
        },
      });

      return media;
    });
  }

  static async linkMedia(productId: string, mediaId: string) {
    return await prisma.mediaProduct.create({
      data: {
        productId,
        mediaId,
      },
    });
  }

  static async removeMedia(mediaId: string, productId: string) {
    return await prisma.$transaction(async (tx) => {
      // Find relation first
      const mp = await tx.mediaProduct.findFirst({
        where: { mediaId, productId },
      });

      if (mp) {
        await tx.mediaProduct.delete({
          where: { id: mp.id },
        });
      }
      // We purposefully no longer delete the master `Media` record
      // because it may be utilized by other products or exist in the Media Library.
    });
  }

  static async count() {
    return await prisma.product.count({
      where: {
        deletedAt: null,
        status: "ACTIVE",
      },
    });
  }
}
