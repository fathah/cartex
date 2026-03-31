import { PaymentMethodType, Prisma, InventoryPolicy } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

function decimal(value: number) {
  return new Prisma.Decimal(value);
}

function buildAddress() {
  return {
    address1: "123 Test St",
    address2: null,
    city: "Dubai",
    country: "AE",
    customerId: "customer_1",
    fullname: "Test User",
    id: "address_1",
    phone: "+971500000000",
    province: "Dubai",
    zip: "00000",
  };
}

function buildPaymentMethod() {
  return {
    code: "COD",
    fee: decimal(0),
    feeType: "FLAT",
    id: "payment_cod",
    isActive: true,
    type: PaymentMethodType.COD,
  };
}

function buildZone() {
  return {
    id: "zone_1",
    methods: [
      {
        code: "standard",
        id: "method_1",
        isActive: true,
        name: "Standard Delivery",
        rates: [
          {
            applicationType: "BASE",
            id: "rate_base",
            isActive: true,
            price: decimal(20),
            priority: 0,
            shippingZoneId: "zone_1",
            type: "FLAT",
          },
        ],
      },
    ],
  };
}

function buildVariant(input: {
  id: string;
  inventoryQuantity?: number;
  minOrderQty?: number;
  price?: number;
  productName?: string;
  profile?: {
    code: string;
    handlingFee?: number;
    id: string;
    name: string;
  } | null;
  requiresShipping: boolean;
  sku?: string;
  weightGrams?: number;
}) {
  return {
    compareAtPrice: null,
    costPrice: null,
    id: input.id,
    inventory: {
      quantity: input.inventoryQuantity ?? 10,
    },
    inventoryPolicy: InventoryPolicy.DENY,
    product: {
      name: input.productName ?? input.id,
      shippingProfile: input.profile ?? null,
      status: "ACTIVE",
    },
    productId: `product_${input.id}`,
    requiresShipping: input.requiresShipping,
    salePrice: decimal(input.price ?? 50),
    selectedOptions: [],
    sku: input.sku ?? `${input.id}-sku`,
    variantMarkets: [
      {
        id: `market_${input.id}`,
        inventoryQuantity: input.inventoryQuantity ?? 10,
        isAvailable: true,
        isPublished: true,
        maxOrderQty: null,
        minOrderQty: input.minOrderQty ?? 1,
        salePrice: decimal(input.price ?? 50),
      },
    ],
    weightGrams: input.weightGrams ?? 0,
  };
}

function setupOrderTest(options: {
  paymentMethod?: ReturnType<typeof buildPaymentMethod>;
  settings?: { currency?: string; taxMode?: string; taxRate?: number };
  variants: any[];
  zone?: ReturnType<typeof buildZone>;
}) {
  const orderCreate = vi.fn().mockResolvedValue({ id: "order_1" });
  const paymentIntentCreate = vi.fn().mockResolvedValue({ id: "pi_1" });
  const variantMarketUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
  const variantMarketUpdate = vi.fn().mockResolvedValue({});
  const inventoryUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
  const inventoryUpdate = vi.fn().mockResolvedValue({});
  const inventoryCreate = vi.fn().mockResolvedValue({});

  vi.doMock("@/actions/user", () => ({
    getCurrentUser: vi.fn().mockResolvedValue({ id: "customer_1" }),
  }));
  vi.doMock("@/db/settings", () => ({
    default: {
      get: vi.fn().mockResolvedValue({
        currency: "AED",
        taxMode: "EXCLUSIVE",
        taxRate: 0,
        ...options.settings,
      }),
    },
  }));
  vi.doMock("@/db/shipping", () => ({
    ShippingDB: {
      findZoneForAddress: vi.fn().mockResolvedValue(options.zone ?? buildZone()),
    },
  }));
  vi.doMock("@/db/payment", () => ({
    PaymentDB: {
      getCheckoutMethodByCode: vi
        .fn()
        .mockResolvedValue(options.paymentMethod ?? buildPaymentMethod()),
    },
  }));
  vi.doMock("@/lib/market", () => ({
    resolveCurrentMarket: vi.fn().mockResolvedValue({
      code: "AE",
      countryCode: "AE",
      currencyCode: "AED",
      id: "market_ae",
    }),
  }));
  vi.doMock("next/cache", () => ({
    revalidatePath: vi.fn(),
  }));
  vi.doMock("@/db/prisma", () => ({
    default: {
      address: {
        findFirst: vi.fn().mockResolvedValue(buildAddress()),
      },
      market: {
        findFirst: vi.fn().mockResolvedValue({
          code: "AE",
          countryCode: "AE",
          currencyCode: "AED",
          id: "market_ae",
          isActive: true,
        }),
      },
      order: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      $transaction: vi.fn(async (callback: any) =>
        callback({
          inventory: {
            create: inventoryCreate,
            update: inventoryUpdate,
            updateMany: inventoryUpdateMany,
          },
          order: {
            create: orderCreate,
            findFirst: vi.fn().mockResolvedValue(null),
          },
          paymentIntent: {
            create: paymentIntentCreate,
          },
          productVariant: {
            findMany: vi.fn().mockResolvedValue(options.variants),
          },
          variantMarket: {
            update: variantMarketUpdate,
            updateMany: variantMarketUpdateMany,
          },
        }),
      ),
    },
  }));

  return {
    inventoryCreate,
    inventoryUpdate,
    inventoryUpdateMany,
    orderCreate,
    paymentIntentCreate,
    variantMarketUpdate,
    variantMarketUpdateMany,
  };
}

describe("actions/orders createOrder", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates an order with shipping charges for a physical cart", async () => {
    const mocks = setupOrderTest({
      variants: [
        buildVariant({
          id: "variant_physical",
          price: 100,
          requiresShipping: true,
          weightGrams: 750,
        }),
      ],
    });

    const { createOrder } = await import("@/actions/orders");

    const result = await createOrder({
      checkoutRequestId: "checkout-physical-001",
      items: [{ quantity: 2, variantId: "variant_physical" }],
      paymentMethodCode: "COD",
      shippingAddressId: "address_1",
      shippingMethodCode: "standard",
    });

    expect(result).toEqual({ success: true, orderId: "order_1" });
    expect(mocks.orderCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shippingTotal: 20,
        subtotal: 200,
        totalPrice: 220,
      }),
      select: { id: true },
    });
    expect(mocks.variantMarketUpdateMany).toHaveBeenCalledTimes(1);
    expect(mocks.variantMarketUpdateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: "market_variant_physical",
        inventoryQuantity: { gte: 2 },
      }),
      data: {
        inventoryQuantity: {
          decrement: 2,
        },
      },
    });
  });

  it("creates a zero-shipping order for a cart with only non-shippable variants", async () => {
    const mocks = setupOrderTest({
      variants: [
        buildVariant({
          id: "variant_digital",
          price: 49,
          requiresShipping: false,
          weightGrams: 0,
        }),
      ],
    });

    const { createOrder } = await import("@/actions/orders");

    await createOrder({
      checkoutRequestId: "checkout-digital-001",
      items: [{ quantity: 1, variantId: "variant_digital" }],
      paymentMethodCode: "COD",
      shippingAddressId: "address_1",
      shippingMethodCode: "standard",
    });

    expect(mocks.orderCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shippingTotal: 0,
        subtotal: 49,
        totalPrice: 49,
      }),
      select: { id: true },
    });
    expect(mocks.variantMarketUpdateMany).toHaveBeenCalledTimes(1);
    expect(mocks.variantMarketUpdateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: "market_variant_digital",
        inventoryQuantity: { gte: 1 },
      }),
      data: {
        inventoryQuantity: {
          decrement: 1,
        },
      },
    });
  });

  it("charges shipping only for the shippable part of a mixed cart", async () => {
    const mocks = setupOrderTest({
      variants: [
        buildVariant({
          id: "variant_physical",
          price: 120,
          requiresShipping: true,
          weightGrams: 500,
        }),
        buildVariant({
          id: "variant_digital",
          price: 30,
          requiresShipping: false,
          weightGrams: 0,
        }),
      ],
    });

    const { createOrder } = await import("@/actions/orders");

    await createOrder({
      checkoutRequestId: "checkout-mixed-001",
      items: [
        { quantity: 1, variantId: "variant_physical" },
        { quantity: 2, variantId: "variant_digital" },
      ],
      paymentMethodCode: "COD",
      shippingAddressId: "address_1",
      shippingMethodCode: "standard",
    });

    expect(mocks.orderCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shippingTotal: 20,
        subtotal: 180,
        totalPrice: 200,
      }),
      select: { id: true },
    });
    expect(mocks.variantMarketUpdateMany).toHaveBeenCalledTimes(2);
  });

  it("combines surcharges from multiple shipping profiles in one order", async () => {
    const zone = buildZone();
    zone.methods[0].rates.push(
      {
        applicationType: "SURCHARGE",
        id: "rate_fragile",
        isActive: true,
        price: decimal(5),
        priority: 1,
        shippingProfileId: "profile_fragile",
        shippingZoneId: "zone_1",
        type: "FLAT",
      },
      {
        applicationType: "SURCHARGE",
        id: "rate_heavy",
        isActive: true,
        price: decimal(7),
        priority: 2,
        shippingProfileId: "profile_heavy",
        shippingZoneId: "zone_1",
        type: "FLAT",
      },
    );

    const mocks = setupOrderTest({
      variants: [
        buildVariant({
          id: "variant_fragile",
          price: 80,
          profile: {
            code: "FRAGILE",
            handlingFee: 3,
            id: "profile_fragile",
            name: "Fragile",
          },
          requiresShipping: true,
          weightGrams: 400,
        }),
        buildVariant({
          id: "variant_heavy",
          price: 150,
          profile: {
            code: "HEAVY",
            handlingFee: 2,
            id: "profile_heavy",
            name: "Heavy",
          },
          requiresShipping: true,
          weightGrams: 1600,
        }),
      ],
      zone,
    });

    const { createOrder } = await import("@/actions/orders");

    await createOrder({
      checkoutRequestId: "checkout-profiles-001",
      items: [
        { quantity: 1, variantId: "variant_fragile" },
        { quantity: 1, variantId: "variant_heavy" },
      ],
      paymentMethodCode: "COD",
      shippingAddressId: "address_1",
      shippingMethodCode: "standard",
    });

    expect(mocks.orderCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shippingTotal: 37,
        subtotal: 230,
        totalPrice: 267,
      }),
      select: { id: true },
    });
    expect(mocks.paymentIntentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 267,
        orderId: "order_1",
        paymentMethodId: "payment_cod",
        status: "PENDING",
      }),
    });
  });
});
