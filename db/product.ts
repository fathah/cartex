import prisma from "./prisma";
import { ProductStatus, Prisma } from "@prisma/client";

export type CreateProductData = {
  name: string;
  description?: string;
  status?: ProductStatus;
  slug: string;
  seoTitle?: string;
  seoDesc?: string;
  salePrice?: number; // Optional initial price
  compareAtPrice?: number;
  costPrice?: number;
  productBrandId?: string;
  isFeatured?: boolean;
  shippingProfileId?: string;
};

export default class ProductDB {
  static buildVariantInclude(marketId?: string, includeAllMarkets = false) {
    if (includeAllMarkets) {
      return {
        selectedOptions: true,
        inventory: true,
        variantMarkets: {
          include: {
            market: true,
          },
          orderBy: {
            createdAt: "asc" as const,
          },
        },
        image: true,
      };
    }

    return {
      selectedOptions: true,
      inventory: true,
      image: true,
      _count: {
        select: {
          variantMarkets: true,
        },
      },
      ...(marketId
        ? {
            variantMarkets: {
              where: { marketId },
              take: 1,
              include: {
                market: true,
              },
            },
          }
        : {}),
    };
  }

  static async create(data: CreateProductData) {
    const { salePrice, compareAtPrice, costPrice, ...productData } = data;

    return await prisma.$transaction(async (tx) => {
      const defaultShippingProfile = productData.shippingProfileId
        ? null
        : await tx.shippingProfile.findFirst({
            where: { isDefault: true },
            select: { id: true },
          });

      const product = await tx.product.create({
        data: {
          ...productData,
          shippingProfileId:
            productData.shippingProfileId || defaultShippingProfile?.id || null,
        },
      });

      // Create default variant
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          title: "Default Variant",
          salePrice: salePrice || 0,
          compareAtPrice: compareAtPrice ?? null,
          costPrice: costPrice ?? null,
          sku: "", // Generate or empty
        },
      });

      const activeMarkets = await tx.market.findMany({
        where: { isActive: true },
      });
      if (activeMarkets.length > 0) {
        await tx.variantMarket.createMany({
          data: activeMarkets.map((market) => ({
            variantId: variant.id,
            marketId: market.id,
            salePrice: salePrice || 0,
            compareAtPrice: compareAtPrice ?? null,
            costPrice: costPrice ?? null,
            inventoryQuantity: 0,
            isAvailable: true,
            isPublished: true,
          })),
        });
      }

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
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: ProductDB.buildVariantInclude(undefined, true),
        },
        collections: true,
        shippingProfile: true,
        mediaProducts: {
          include: { media: true },
        },
        brand: true,
      },
    });
  }

  static async findBySlug(slug: string, marketId?: string) {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        options: {
          include: { values: true },
          orderBy: { position: "asc" },
        },
        variants: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: ProductDB.buildVariantInclude(marketId),
        },
        collections: true,
        shippingProfile: true,
        mediaProducts: {
          include: { media: true },
        },
        brand: true,
      },
    });
  }

  static async list(
    page = 1,
    limit = 20,
    status?: ProductStatus,
    marketId?: string,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(status && { status }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            ...(marketId ? {} : { take: 1 }),
            include: ProductDB.buildVariantInclude(marketId),
          },
          mediaProducts: {
            take: 1,
            include: { media: true },
          },
          collections: {
            take: 1,
          },
          shippingProfile: true,
          brand: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, totalPages: Math.ceil(total / limit) };
  }

  static async listDeals(
    page = 1,
    limit = 20,
    status?: ProductStatus,
    marketId?: string,
  ) {
    const skip = (page - 1) * limit;

    // Prisma doesn't natively support comparing two columns inside the same relational table easily via 'where'.
    // We fetch all active products, then filter them by JS math where salePrice < compareAtPrice.

    // First retrieve the matching base products
    const rawProducts = await prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(status && { status }),
      },
      include: {
        variants: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: ProductDB.buildVariantInclude(marketId),
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
      const compareAt = Number(v.compareAtPrice) || 0;
      return sale > 0 && compareAt > 0 && sale < compareAt;
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

  static async listByCollectionId(
    collectionId: string,
    page = 1,
    limit = 20,
    status?: ProductStatus,
    marketId?: string,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      collections: {
        some: {
          id: collectionId,
        },
      },
      ...(status && { status }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            ...(marketId ? {} : { take: 1 }),
            include: ProductDB.buildVariantInclude(marketId),
          },
          mediaProducts: {
            take: 1,
            include: { media: true },
          },
          collections: {
            take: 1,
          },
          shippingProfile: true,
          brand: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, totalPages: Math.ceil(total / limit) };
  }

  static async listByBrandId(
    brandId: string,
    page = 1,
    limit = 20,
    status?: ProductStatus,
    marketId?: string,
  ) {
    const skip = (Number(page) - 1) * Number(limit);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      productBrandId: brandId,
      ...(status && { status }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            ...(marketId ? {} : { take: 1 }),
            include: ProductDB.buildVariantInclude(marketId),
          },
          mediaProducts: {
            take: 1,
            include: { media: true },
          },
          collections: {
            take: 1,
          },
          shippingProfile: true,
          brand: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, totalPages: Math.ceil(total / limit) };
  }

  static async listByIds(ids: string[], marketId?: string) {
    return await prisma.product.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      include: {
        variants: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          ...(marketId ? {} : { take: 1 }),
          include: ProductDB.buildVariantInclude(marketId),
        },
        mediaProducts: {
          take: 1,
          include: { media: true },
        },
        collections: {
          take: 1,
        },
        shippingProfile: true,
        brand: true,
      },
    });
  }

  static async listFeatured(limit = 4, marketId?: string) {
    return await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        isFeatured: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        variants: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          ...(marketId ? {} : { take: 1 }),
          include: ProductDB.buildVariantInclude(marketId),
        },
        mediaProducts: {
          take: 1,
          include: { media: true },
        },
        collections: {
          take: 1,
        },
        shippingProfile: true,
        brand: true,
      },
    });
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
    const normalizedValues = Array.from(
      new Map(
        values
          .map((v) => v.trim())
          .filter(Boolean)
          .map((v) => [v.toLowerCase(), v]),
      ).values(),
    );

    return await prisma.$transaction(async (tx) => {
      const maxPosition = await tx.option.aggregate({
        where: { productId },
        _max: { position: true },
      });

      const option = await tx.option.create({
        data: {
          productId,
          name,
          position: (maxPosition._max.position ?? -1) + 1,
          values: {
            create: normalizedValues.map((v) => ({ value: v })),
          },
        },
        include: { values: true },
      });
      return option;
    });
  }

  static async updateOption(optionId: string, name: string, values: string[]) {
    const normalizedValues = Array.from(
      new Map(
        values
          .map((v) => v.trim())
          .filter(Boolean)
          .map((v) => [v.toLowerCase(), v]),
      ).values(),
    );

    return await prisma.$transaction(async (tx) => {
      const option = await tx.option.update({
        where: { id: optionId },
        data: { name },
        include: { values: true },
      });

      const existing = option.values;
      const remainingLower = new Set(
        normalizedValues.map((v) => v.toLowerCase()),
      );

      for (const val of existing) {
        const lower = val.value.toLowerCase();
        if (remainingLower.has(lower)) {
          const updated = normalizedValues.find(
            (v) => v.toLowerCase() === lower,
          );
          if (updated && updated !== val.value) {
            await tx.optionValue.update({
              where: { id: val.id },
              data: { value: updated },
            });
          }
          remainingLower.delete(lower);
        } else {
          await tx.optionValue.delete({ where: { id: val.id } });
        }
      }

      for (const val of normalizedValues) {
        if (remainingLower.has(val.toLowerCase())) {
          await tx.optionValue.create({
            data: { optionId: option.id, value: val },
          });
        }
      }

      return option;
    });
  }

  static async deleteOption(optionId: string) {
    return await prisma.option.delete({
      where: { id: optionId },
    });
  }

  static async syncVariants(productId: string) {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          options: {
            include: { values: true },
            orderBy: { position: "asc" },
          },
          variants: {
            orderBy: { createdAt: "asc" },
            include: {
              ...ProductDB.buildVariantInclude(undefined, true),
            },
          },
        },
      });

      if (!product) return;

      const activeVariants = product.variants.filter(
        (v) => v.deletedAt === null,
      );
      const deletedVariants = product.variants.filter(
        (v) => v.deletedAt !== null,
      );
      const baseVariant =
        activeVariants.find(
          (v) =>
            Number(v.salePrice) > 0 ||
            Number(v.compareAtPrice) > 0 ||
            Number(v.costPrice) > 0,
        ) || activeVariants[0];

      const baseInventory = baseVariant?.inventory?.quantity ?? 0;
      const baseSalePrice = Number(baseVariant?.salePrice || 0);
      const baseCompareAtPrice =
        baseVariant?.compareAtPrice !== null &&
        baseVariant?.compareAtPrice !== undefined
          ? Number(baseVariant.compareAtPrice)
          : null;
      const baseCostPrice =
        baseVariant?.costPrice !== null && baseVariant?.costPrice !== undefined
          ? Number(baseVariant.costPrice)
          : null;
      const baseMarketPrices = (baseVariant?.variantMarkets || []).map((entry) => ({
        marketId: entry.marketId,
        salePrice: entry.salePrice,
        compareAtPrice: entry.compareAtPrice,
        costPrice: entry.costPrice,
        inventoryQuantity: entry.inventoryQuantity,
        reservedQuantity: entry.reservedQuantity,
        isAvailable: entry.isAvailable,
        isPublished: entry.isPublished,
        minOrderQty: entry.minOrderQty,
        maxOrderQty: entry.maxOrderQty,
      }));

      const options = product.options.filter((opt) => opt.values.length > 0);

      if (!options.length) {
        const defaultVariant = activeVariants[0];

        if (defaultVariant) {
          await tx.productVariant.update({
            where: { id: defaultVariant.id },
            data: {
              title: "Default Variant",
              deletedAt: null,
              selectedOptions: { set: [] },
            },
          });

          for (const variant of activeVariants.slice(1)) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: { deletedAt: new Date() },
            });
          }
        } else {
          const created = await tx.productVariant.create({
            data: {
              productId,
              title: "Default Variant",
              salePrice: baseSalePrice,
              compareAtPrice: baseCompareAtPrice,
              costPrice: baseCostPrice,
            },
          });

          if (baseMarketPrices.length > 0) {
            await tx.variantMarket.createMany({
              data: baseMarketPrices.map((entry) => ({
                ...entry,
                variantId: created.id,
              })),
            });
          }

          if (baseInventory > 0) {
            await tx.inventory.create({
              data: {
                variantId: created.id,
                quantity: baseInventory,
              },
            });
          }
        }

        return;
      }

      const generateCombinations = (index: number, current: any[]): any[][] => {
        if (index === options.length) return [current];
        const result: any[][] = [];
        for (const value of options[index].values) {
          result.push(...generateCombinations(index + 1, [...current, value]));
        }
        return result;
      };

      const combinations = generateCombinations(0, []);
      const optionOrder = new Map(options.map((opt, idx) => [opt.id, idx]));
      const valueToOption = new Map<string, string>();

      for (const opt of options) {
        for (const val of opt.values) {
          valueToOption.set(val.id, opt.id);
        }
      }

      const makeKey = (valueIds: string[]) => valueIds.join("|");
      const validKeys = new Set<string>();
      const existingMap = new Map<string, (typeof activeVariants)[number]>();
      const deletedKeys = new Set<string>();

      for (const variant of activeVariants) {
        const selected = variant.selectedOptions || [];
        const ordered = selected
          .map((value) => ({
            id: value.id,
            optionId: valueToOption.get(value.id),
          }))
          .sort((a, b) => {
            const aPos = optionOrder.get(a.optionId || "") ?? 0;
            const bPos = optionOrder.get(b.optionId || "") ?? 0;
            return aPos - bPos;
          });

        const isValidSelection =
          ordered.length === options.length &&
          ordered.every((item) => item.optionId && valueToOption.has(item.id));

        if (!isValidSelection) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { deletedAt: new Date() },
          });
          continue;
        }

        const key = makeKey(ordered.map((item) => item.id));
        if (existingMap.has(key)) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { deletedAt: new Date() },
          });
          continue;
        }

        existingMap.set(key, variant);
      }

      for (const variant of deletedVariants) {
        const selected = variant.selectedOptions || [];
        const ordered = selected
          .map((value) => ({
            id: value.id,
            optionId: valueToOption.get(value.id),
          }))
          .sort((a, b) => {
            const aPos = optionOrder.get(a.optionId || "") ?? 0;
            const bPos = optionOrder.get(b.optionId || "") ?? 0;
            return aPos - bPos;
          });

        const isValidSelection =
          ordered.length === options.length &&
          ordered.every((item) => item.optionId && valueToOption.has(item.id));

        if (isValidSelection) {
          deletedKeys.add(makeKey(ordered.map((item) => item.id)));
        }
      }

      for (const combo of combinations) {
        const orderedIds = combo.map((value) => value.id);
        const key = makeKey(orderedIds);
        validKeys.add(key);
        const title = combo.map((value) => value.value).join(" / ");
        const existing = existingMap.get(key);

        if (existing) {
          if (existing.title !== title) {
            await tx.productVariant.update({
              where: { id: existing.id },
              data: { title, deletedAt: null },
            });
          }
          continue;
        }

        if (deletedKeys.has(key)) {
          continue;
        }

        const created = await tx.productVariant.create({
          data: {
            productId,
            title,
            salePrice: baseSalePrice,
            compareAtPrice: baseCompareAtPrice,
            costPrice: baseCostPrice,
            selectedOptions: {
              connect: combo.map((value) => ({ id: value.id })),
            },
          },
        });

        if (baseMarketPrices.length > 0) {
          await tx.variantMarket.createMany({
            data: baseMarketPrices.map((entry) => ({
              ...entry,
              variantId: created.id,
            })),
          });
        }

        if (baseInventory > 0) {
          await tx.inventory.create({
            data: {
              variantId: created.id,
              quantity: baseInventory,
            },
          });
        }
      }

      for (const [key, variant] of existingMap.entries()) {
        if (!validKeys.has(key)) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { deletedAt: new Date() },
          });
        }
      }
    });
  }

  static async generateVariants(productId: string) {
    return await ProductDB.syncVariants(productId);
  }

  static async updateVariant(
    variantId: string,
    data: {
      salePrice: number;
      compareAtPrice?: number | null;
      costPrice?: number | null;
      sku?: string;
      inventory: number;
      requiresShipping?: boolean;
      weightGrams?: number;
      lengthCm?: number | null;
      widthCm?: number | null;
      heightCm?: number | null;
      marketPrices?: Array<{
        marketId: string;
        salePrice: number;
        compareAtPrice?: number | null;
        costPrice?: number | null;
        inventoryQuantity?: number | null;
        isAvailable?: boolean;
        isPublished?: boolean;
        minOrderQty?: number | null;
        maxOrderQty?: number | null;
      }>;
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // Update variant details
      const variant = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          salePrice: data.salePrice,
          compareAtPrice: data.compareAtPrice ?? null,
          costPrice: data.costPrice ?? null,
          sku: data.sku,
          requiresShipping: data.requiresShipping ?? true,
          weightGrams: data.weightGrams ?? 0,
          lengthCm: data.lengthCm ?? null,
          widthCm: data.widthCm ?? null,
          heightCm: data.heightCm ?? null,
        },
      });

      // Update inventory
      await tx.inventory.upsert({
        where: { variantId },
        create: { variantId, quantity: data.inventory },
        update: { quantity: data.inventory },
      });

      if (data.marketPrices) {
        for (const marketPrice of data.marketPrices) {
          await tx.variantMarket.upsert({
            where: {
              variantId_marketId: {
                variantId,
                marketId: marketPrice.marketId,
              },
            },
            create: {
              variantId,
              marketId: marketPrice.marketId,
              salePrice: marketPrice.salePrice,
              compareAtPrice: marketPrice.compareAtPrice ?? null,
              costPrice: marketPrice.costPrice ?? null,
              inventoryQuantity: marketPrice.inventoryQuantity ?? 0,
              isAvailable: marketPrice.isAvailable ?? true,
              isPublished: marketPrice.isPublished ?? true,
              minOrderQty: marketPrice.minOrderQty ?? 1,
              maxOrderQty: marketPrice.maxOrderQty ?? null,
            },
            update: {
              salePrice: marketPrice.salePrice,
              compareAtPrice: marketPrice.compareAtPrice ?? null,
              costPrice: marketPrice.costPrice ?? null,
              inventoryQuantity: marketPrice.inventoryQuantity ?? 0,
              isAvailable: marketPrice.isAvailable ?? true,
              isPublished: marketPrice.isPublished ?? true,
              minOrderQty: marketPrice.minOrderQty ?? 1,
              maxOrderQty: marketPrice.maxOrderQty ?? null,
            },
          });
        }
      }

      return variant;
    });
  }

  static async deleteVariant(variantId: string) {
    return await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new Error("Variant not found");
      }

      const activeCount = await tx.productVariant.count({
        where: {
          productId: variant.productId,
          deletedAt: null,
        },
      });

      if (activeCount <= 1) {
        throw new Error("A product must have at least one active variant");
      }

      return await tx.productVariant.update({
        where: { id: variantId },
        data: { deletedAt: new Date() },
      });
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
