import { beforeEach, describe, expect, it, vi } from "vitest";

describe("db/product", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates a product with the default shipping profile and a default variant", async () => {
    const createProduct = vi.fn().mockResolvedValue({ id: "product_1" });
    const createVariant = vi.fn().mockResolvedValue({ id: "variant_1" });
    const createManyVariantMarkets = vi.fn().mockResolvedValue({ count: 2 });

    vi.doMock("@/db/prisma", () => ({
      default: {
        $transaction: vi.fn(async (callback: any) =>
          callback({
            market: {
              findMany: vi.fn().mockResolvedValue([
                { id: "market_1" },
                { id: "market_2" },
              ]),
            },
            product: {
              create: createProduct,
            },
            productVariant: {
              create: createVariant,
            },
            shippingProfile: {
              findFirst: vi.fn().mockResolvedValue({ id: "profile_default" }),
            },
            variantMarket: {
              createMany: createManyVariantMarkets,
            },
          }),
        ),
      },
    }));

    const ProductDB = (await import("@/db/product")).default;

    await ProductDB.create({
      name: "Digital Perfume Guide",
      salePrice: 49,
      slug: "digital-perfume-guide",
    });

    expect(createProduct).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Digital Perfume Guide",
        shippingProfileId: "profile_default",
        slug: "digital-perfume-guide",
      }),
    });
    expect(createVariant).toHaveBeenCalledWith({
      data: expect.objectContaining({
        compareAtPrice: null,
        costPrice: null,
        productId: "product_1",
        salePrice: 49,
        sku: "",
        title: "Default Variant",
      }),
    });
    expect(createManyVariantMarkets).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          inventoryQuantity: 0,
          isAvailable: true,
          isPublished: true,
          marketId: "market_1",
          salePrice: 49,
          variantId: "variant_1",
        }),
        expect.objectContaining({
          inventoryQuantity: 0,
          isAvailable: true,
          isPublished: true,
          marketId: "market_2",
          salePrice: 49,
          variantId: "variant_1",
        }),
      ],
    });
  });

  it("preserves an explicit shipping profile when creating a product", async () => {
    const createProduct = vi.fn().mockResolvedValue({ id: "product_2" });

    vi.doMock("@/db/prisma", () => ({
      default: {
        $transaction: vi.fn(async (callback: any) =>
          callback({
            market: {
              findMany: vi.fn().mockResolvedValue([]),
            },
            product: {
              create: createProduct,
            },
            productVariant: {
              create: vi.fn().mockResolvedValue({ id: "variant_2" }),
            },
            shippingProfile: {
              findFirst: vi.fn(),
            },
            variantMarket: {
              createMany: vi.fn(),
            },
          }),
        ),
      },
    }));

    const ProductDB = (await import("@/db/product")).default;

    await ProductDB.create({
      name: "Heavy Gift Box",
      shippingProfileId: "profile_heavy",
      slug: "heavy-gift-box",
    });

    expect(createProduct).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Heavy Gift Box",
        shippingProfileId: "profile_heavy",
        slug: "heavy-gift-box",
      }),
    });
  });

  it("updates variant shipping flags, weight, inventory, and market pricing", async () => {
    const updateVariant = vi.fn().mockResolvedValue({
      id: "variant_3",
      productId: "product_3",
      requiresShipping: false,
      weightGrams: 0,
    });
    const upsertInventory = vi.fn().mockResolvedValue({ variantId: "variant_3" });
    const upsertVariantMarket = vi.fn().mockResolvedValue({ id: "vm_1" });

    vi.doMock("@/db/prisma", () => ({
      default: {
        $transaction: vi.fn(async (callback: any) =>
          callback({
            inventory: {
              upsert: upsertInventory,
            },
            productVariant: {
              update: updateVariant,
            },
            variantMarket: {
              upsert: upsertVariantMarket,
            },
          }),
        ),
      },
    }));

    const ProductDB = (await import("@/db/product")).default;

    await ProductDB.updateVariant("variant_3", {
      inventory: 12,
      marketPrices: [
        {
          inventoryQuantity: 7,
          isAvailable: true,
          isPublished: false,
          marketId: "market_ae",
          maxOrderQty: 4,
          minOrderQty: 2,
          salePrice: 99,
        },
      ],
      requiresShipping: false,
      salePrice: 99,
      sku: "DIGI-001",
      weightGrams: 0,
    });

    expect(updateVariant).toHaveBeenCalledWith({
      where: { id: "variant_3" },
      data: expect.objectContaining({
        requiresShipping: false,
        salePrice: 99,
        sku: "DIGI-001",
        weightGrams: 0,
      }),
    });
    expect(upsertInventory).toHaveBeenCalledWith({
      where: { variantId: "variant_3" },
      create: { quantity: 12, variantId: "variant_3" },
      update: { quantity: 12 },
    });
    expect(upsertVariantMarket).toHaveBeenCalledWith({
      where: {
        variantId_marketId: {
          marketId: "market_ae",
          variantId: "variant_3",
        },
      },
      create: expect.objectContaining({
        inventoryQuantity: 7,
        isAvailable: true,
        isPublished: false,
        marketId: "market_ae",
        maxOrderQty: 4,
        minOrderQty: 2,
        salePrice: 99,
        variantId: "variant_3",
      }),
      update: expect.objectContaining({
        inventoryQuantity: 7,
        isAvailable: true,
        isPublished: false,
        maxOrderQty: 4,
        minOrderQty: 2,
        salePrice: 99,
      }),
    });
  });
});
