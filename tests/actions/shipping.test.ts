import { beforeEach, describe, expect, it, vi } from "vitest";

describe("actions/shipping", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("uses the tax-normalized subtotal for shipping quotes", async () => {
    const findZoneForAddress = vi.fn().mockResolvedValue({
      id: "zone_1",
      methods: [
        {
          code: "standard",
          id: "method_1",
          isActive: true,
          name: "Standard",
          rates: [
            {
              applicationType: "BASE",
              id: "rate_flat",
              isActive: true,
              price: 20,
              priority: 1,
              shippingProfileId: null,
              shippingZoneId: "zone_1",
              type: "FLAT",
            },
            {
              applicationType: "BASE",
              id: "rate_free",
              isActive: true,
              minOrderAmount: 105,
              price: 0,
              priority: 0,
              shippingProfileId: null,
              shippingZoneId: "zone_1",
              type: "CONDITIONAL",
            },
          ],
        },
      ],
    });

    vi.doMock("@/db/shipping", () => ({
      ShippingDB: {
        findZoneForAddress,
      },
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {
        productVariant: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "variant_1",
              product: { shippingProfile: null },
              requiresShipping: true,
              weightGrams: 250,
            },
          ]),
        },
      },
    }));
    vi.doMock("@/db/settings", () => ({
      default: {
        get: vi.fn().mockResolvedValue({
          taxMode: "INCLUSIVE",
          taxRate: 10,
        }),
      },
    }));
    vi.doMock("@/services/zauth", () => ({
      requireAdminAuth: vi.fn(),
    }));
    vi.doMock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));

    const { getSmartShippingMethods } = await import("@/actions/shipping");

    const methods = await getSmartShippingMethods("AE", 110, [
      { quantity: 1, variantId: "variant_1" },
    ]);

    expect(methods).toHaveLength(1);
    expect(methods[0]).toEqual(
      expect.objectContaining({
        calculatedPrice: 20,
        code: "standard",
      }),
    );
  });

  it("passes null values through when clearing shipping rate bounds", async () => {
    const updateRate = vi.fn().mockResolvedValue({ id: "rate_1" });

    vi.doMock("@/db/shipping", () => ({
      ShippingDB: {
        updateRate,
      },
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {},
    }));
    vi.doMock("@/db/settings", () => ({
      default: {
        get: vi.fn(),
      },
    }));
    vi.doMock("@/services/zauth", () => ({
      requireAdminAuth: vi.fn().mockResolvedValue(undefined),
    }));
    vi.doMock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));

    const { updateShippingRate } = await import("@/actions/shipping");

    await updateShippingRate("rate_1", {
      max: null,
      maxWeightGrams: null,
      min: null,
      minWeightGrams: null,
    });

    expect(updateRate).toHaveBeenCalledWith(
      "rate_1",
      expect.objectContaining({
        max: null,
        maxWeightGrams: null,
        min: null,
        minWeightGrams: null,
      }),
    );
  });

  it("returns free shipping when the cart has no shippable items", async () => {
    vi.doMock("@/db/shipping", () => ({
      ShippingDB: {
        findZoneForAddress: vi.fn().mockResolvedValue({
          id: "zone_2",
          methods: [
            {
              code: "standard",
              id: "method_2",
              isActive: true,
              name: "Standard",
              rates: [
                {
                  applicationType: "BASE",
                  id: "rate_2",
                  isActive: true,
                  price: 15,
                  shippingZoneId: "zone_2",
                  type: "FLAT",
                },
              ],
            },
          ],
        }),
      },
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {
        productVariant: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "variant_digital",
              product: { shippingProfile: null },
              requiresShipping: false,
              weightGrams: 0,
            },
          ]),
        },
      },
    }));
    vi.doMock("@/db/settings", () => ({
      default: {
        get: vi.fn().mockResolvedValue({
          taxMode: "EXCLUSIVE",
          taxRate: 0,
        }),
      },
    }));
    vi.doMock("@/services/zauth", () => ({
      requireAdminAuth: vi.fn(),
    }));
    vi.doMock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));

    const { getSmartShippingMethods } = await import("@/actions/shipping");

    const methods = await getSmartShippingMethods("AE", 49, [
      { quantity: 1, variantId: "variant_digital" },
    ]);

    expect(methods).toHaveLength(1);
    expect(methods[0]).toEqual(
      expect.objectContaining({
        calculatedPrice: 0,
        totalWeightGrams: 0,
      }),
    );
  });

  it("ignores non-shippable variants and applies profile surcharges to shippable products only", async () => {
    vi.doMock("@/db/shipping", () => ({
      ShippingDB: {
        findZoneForAddress: vi.fn().mockResolvedValue({
          id: "zone_3",
          methods: [
            {
              code: "express",
              id: "method_3",
              isActive: true,
              name: "Express",
              rates: [
                {
                  applicationType: "BASE",
                  id: "rate_base",
                  isActive: true,
                  price: 20,
                  priority: 0,
                  shippingZoneId: "zone_3",
                  type: "FLAT",
                },
                {
                  applicationType: "SURCHARGE",
                  id: "rate_surcharge",
                  isActive: true,
                  price: 5,
                  priority: 1,
                  shippingProfileId: "profile_fragile",
                  shippingZoneId: "zone_3",
                  type: "FLAT",
                },
              ],
            },
          ],
        }),
      },
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {
        productVariant: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "variant_fragile",
              product: {
                shippingProfile: {
                  code: "FRAGILE",
                  handlingFee: 3,
                  id: "profile_fragile",
                  name: "Fragile",
                },
              },
              requiresShipping: true,
              weightGrams: 500,
            },
            {
              id: "variant_digital",
              product: { shippingProfile: null },
              requiresShipping: false,
              weightGrams: 0,
            },
          ]),
        },
      },
    }));
    vi.doMock("@/db/settings", () => ({
      default: {
        get: vi.fn().mockResolvedValue({
          taxMode: "EXCLUSIVE",
          taxRate: 0,
        }),
      },
    }));
    vi.doMock("@/services/zauth", () => ({
      requireAdminAuth: vi.fn(),
    }));
    vi.doMock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));

    const { getSmartShippingMethods } = await import("@/actions/shipping");

    const methods = await getSmartShippingMethods("AE", 150, [
      { quantity: 2, variantId: "variant_fragile" },
      { quantity: 1, variantId: "variant_digital" },
    ]);

    expect(methods).toHaveLength(1);
    expect(methods[0]).toEqual(
      expect.objectContaining({
        calculatedPrice: 28,
        surchargeTotal: 8,
        totalWeightGrams: 1000,
      }),
    );
  });
});
