"use server";

import { z } from "zod";
import { ShippingDB } from "@/db/shipping";
import prisma from "@/db/prisma";
import SettingsDB from "@/db/settings";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";
import {
  buildShippingQuoteContext,
  rankShippingQuotes,
  resolveShippingQuote,
} from "@/lib/shipping";
import { calculateTaxBreakdown } from "@/lib/pricing";
import {
  SHIPPING_METHOD_SOURCE,
  SHIPPING_METHOD_SOURCE_VALUES,
  SHIPPING_RATE_APPLICATION,
  SHIPPING_RATE_APPLICATION_VALUES,
  SHIPPING_RATE_TYPE_VALUES,
  type ShippingMethodSourceValue,
  type ShippingRateApplicationValue,
  type ShippingRateTypeValue,
} from "@/lib/shipping-constants";

const REVALIDATE_PATH = "/admin/settings";
const shippingProfileSchema = z.object({
  code: z.string().trim().min(1),
  description: z.string().trim().optional(),
  handlingFee: z.number().nonnegative().default(0),
  isDefault: z.boolean().default(false),
  name: z.string().trim().min(1),
});

const shippingZoneSchema = z.object({
  name: z.string().trim().min(1),
  areas: z.array(
    z.object({
      country: z.string().trim().min(1),
      state: z.string().trim().min(1).default("*"),
    }),
  ),
});

const shippingMethodSchema = z.object({
  code: z.string().trim().min(1),
  description: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  maxDeliveryDays: z.number().int().positive().nullable().optional(),
  minDeliveryDays: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1),
  providerCode: z.string().trim().nullable().optional(),
  providerServiceCode: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  sourceType: z.enum(SHIPPING_METHOD_SOURCE_VALUES).default(
    SHIPPING_METHOD_SOURCE.MANUAL,
  ),
}).refine(
  (data) =>
    data.minDeliveryDays == null ||
    data.maxDeliveryDays == null ||
    data.maxDeliveryDays >= data.minDeliveryDays,
  {
    message: "Max delivery days must be greater than or equal to min delivery days",
    path: ["maxDeliveryDays"],
  },
);

const shippingRateSchema = z.object({
  max: z.number().nonnegative().optional(),
  min: z.number().nonnegative().optional(),
  maxWeightGrams: z.number().int().nonnegative().optional(),
  minWeightGrams: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative(),
  priority: z.number().int().min(0).default(0),
  applicationType: z.enum(SHIPPING_RATE_APPLICATION_VALUES).default(
    SHIPPING_RATE_APPLICATION.BASE,
  ),
  shippingProfileId: z.string().trim().nullable().optional(),
  type: z.enum(SHIPPING_RATE_TYPE_VALUES),
  zoneId: z.string().trim().min(1),
}).refine(
  (data) => data.max === undefined || data.min === undefined || data.max >= data.min,
  {
    message: "Max order amount must be greater than or equal to min order amount",
    path: ["max"],
  },
).refine(
  (data) =>
    data.maxWeightGrams === undefined ||
    data.minWeightGrams === undefined ||
    data.maxWeightGrams >= data.minWeightGrams,
  {
    message: "Max weight must be greater than or equal to min weight",
    path: ["maxWeightGrams"],
  },
);

const updateShippingMethodSchema = z.object({
  code: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  maxDeliveryDays: z.number().int().positive().nullable().optional(),
  minDeliveryDays: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1).optional(),
  providerCode: z.string().trim().nullable().optional(),
  providerServiceCode: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  sourceType: z.enum(SHIPPING_METHOD_SOURCE_VALUES).optional(),
}).refine(
  (data) =>
    data.minDeliveryDays == null ||
    data.maxDeliveryDays == null ||
    data.maxDeliveryDays >= data.minDeliveryDays,
  {
    message: "Max delivery days must be greater than or equal to min delivery days",
    path: ["maxDeliveryDays"],
  },
);

const updateShippingRateSchema = z.object({
  isActive: z.boolean().optional(),
  max: z.number().nonnegative().nullable().optional(),
  min: z.number().nonnegative().nullable().optional(),
  maxWeightGrams: z.number().int().nonnegative().nullable().optional(),
  minWeightGrams: z.number().int().nonnegative().nullable().optional(),
  price: z.number().nonnegative().optional(),
  priority: z.number().int().min(0).optional(),
  applicationType: z.enum(SHIPPING_RATE_APPLICATION_VALUES).optional(),
  shippingProfileId: z.string().trim().nullable().optional(),
  zoneId: z.string().trim().min(1).nullable().optional(),
}).refine(
  (data) =>
    data.max == null || data.min == null || data.max >= data.min,
  {
    message: "Max order amount must be greater than or equal to min order amount",
    path: ["max"],
  },
).refine(
  (data) =>
    data.maxWeightGrams == null ||
    data.minWeightGrams == null ||
    data.maxWeightGrams >= data.minWeightGrams,
  {
    message: "Max weight must be greater than or equal to min weight",
    path: ["maxWeightGrams"],
  },
);

const quoteItemsSchema = z.array(
  z.object({
    quantity: z.number().int().positive(),
    variantId: z.string().trim().min(1),
  }),
);

async function buildCartShippingContext(items: Array<{ variantId: string; quantity: number }>, subtotal: number) {
  const parsedItems = quoteItemsSchema.parse(items);
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: parsedItems.map((item) => item.variantId) },
    },
    include: {
      product: {
        include: {
          shippingProfile: true,
        },
      },
    },
  });

  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  let totalWeightGrams = 0;
  let shippableItemCount = 0;
  const profileMap = new Map<string, { code: string; handlingFee?: number; id: string; name: string }>();

  for (const item of parsedItems) {
    const variant = variantsById.get(item.variantId);
    if (!variant || !variant.requiresShipping) {
      continue;
    }

    shippableItemCount += item.quantity;
    totalWeightGrams += Number(variant.weightGrams || 0) * item.quantity;

    const profile = variant.product.shippingProfile;
    if (profile && !profileMap.has(profile.id)) {
      profileMap.set(profile.id, {
        code: profile.code,
        handlingFee: Number(profile.handlingFee || 0),
        id: profile.id,
        name: profile.name,
      });
    }
  }

  return buildShippingQuoteContext({
    profiles: Array.from(profileMap.values()),
    shippableItemCount,
    subtotal,
    totalWeightGrams,
  });
}

// --- Profiles ---

export async function getShippingProfiles() {
  await requireAdminAuth();
  return ShippingDB.listProfiles();
}

export async function createShippingProfile(data: {
  code: string;
  description?: string;
  handlingFee?: number;
  isDefault?: boolean;
  name: string;
}) {
  await requireAdminAuth();
  const profile = await ShippingDB.createProfile(shippingProfileSchema.parse(data));
  revalidatePath(REVALIDATE_PATH);
  return profile;
}

export async function updateShippingProfile(
  id: string,
  data: {
    code?: string;
    description?: string;
    handlingFee?: number;
    isDefault?: boolean;
    name?: string;
  },
) {
  await requireAdminAuth();
  const profile = await ShippingDB.updateProfile(
    id,
    shippingProfileSchema.partial().parse(data),
  );
  revalidatePath(REVALIDATE_PATH);
  return profile;
}

export async function deleteShippingProfile(id: string) {
  await requireAdminAuth();
  await ShippingDB.deleteProfile(id);
  revalidatePath(REVALIDATE_PATH);
}

// --- Zones ---

export async function getShippingZones() {
  await requireAdminAuth();
  return ShippingDB.listZones();
}

export async function getShippingMethodsForAddress(
  country: string,
  items: Array<{ quantity: number; variantId: string }> = [],
  state?: string,
  city?: string,
  zipCode?: string,
) {
  const zone = await ShippingDB.findZoneForAddress(
    country,
    state,
    city,
    zipCode,
  );
  if (!zone) return [];
  const context = await buildCartShippingContext(items, 0);
  return rankShippingQuotes(
    zone.methods
      .filter((method: any) => method.isActive)
      .flatMap((method: any) => {
        const quote = resolveShippingQuote(method, context, zone.id);
        return quote ? [quote] : [];
      }),
  );
}

/**
 * Smart shipping method resolution.
 * Resolves the correct rate for each method based on the order subtotal.
 * Returns enriched methods with `calculatedPrice`, `freeAbove`, and `isRecommended`.
 */
export async function getSmartShippingMethods(
  country: string,
  subtotal: number,
  items: Array<{ quantity: number; variantId: string }> = [],
  state?: string,
  city?: string,
  zipCode?: string,
) {
  const zone = await ShippingDB.findZoneForAddress(
    country,
    state,
    city,
    zipCode,
  );
  if (!zone) return [];
  const settings = await SettingsDB.get();
  const taxBreakdown = calculateTaxBreakdown({
    cartSum: subtotal,
    taxMode: settings.taxMode || "EXCLUSIVE",
    taxRate: settings.taxRate || 0,
  });
  const context = await buildCartShippingContext(items, taxBreakdown.subtotal);

  return rankShippingQuotes(
    zone.methods
      .filter((method: any) => method.isActive)
      .flatMap((method: any) => {
        const quote = resolveShippingQuote(method, context, zone.id);
        if (!quote) {
          return [];
        }

        return [
          {
            ...quote,
            rates: method.rates,
          },
        ];
      }),
  );
}

export async function createShippingZone(
  name: string,
  areas: { country: string; state: string }[],
) {
  await requireAdminAuth();
  const zone = await ShippingDB.createZone(shippingZoneSchema.parse({ name, areas }));
  revalidatePath(REVALIDATE_PATH);
  return zone;
}

export async function updateShippingZone(
  id: string,
  data: { name?: string; areas?: { country: string; state: string }[] },
) {
  await requireAdminAuth();
  const zone = await ShippingDB.updateZone(id, shippingZoneSchema.partial().parse(data));
  revalidatePath(REVALIDATE_PATH);
  return zone;
}

export async function deleteShippingZone(id: string) {
  await requireAdminAuth();
  await ShippingDB.deleteZone(id);
  revalidatePath(REVALIDATE_PATH);
}

// --- Methods ---

export async function createShippingMethod(
  zoneId: string,
  data: {
    name: string;
    code: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    minDeliveryDays?: number | null;
    maxDeliveryDays?: number | null;
    sourceType?: ShippingMethodSourceValue;
    providerCode?: string | null;
    providerServiceCode?: string | null;
  },
) {
  await requireAdminAuth();
  const method = await ShippingDB.createMethod(
    zoneId,
    shippingMethodSchema.parse(data),
  );
  revalidatePath(REVALIDATE_PATH);
  return method;
}

export async function createShippingStarterPreset(preset: "gcc" | "india") {
  await requireAdminAuth();
  const result = await ShippingDB.seedPreset(preset);
  revalidatePath(REVALIDATE_PATH);
  return result;
}

export async function updateShippingMethod(
  id: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    minDeliveryDays?: number | null;
    maxDeliveryDays?: number | null;
    sourceType?: ShippingMethodSourceValue;
    providerCode?: string | null;
    providerServiceCode?: string | null;
  },
) {
  await requireAdminAuth();
  const method = await ShippingDB.updateMethod(
    id,
    updateShippingMethodSchema.parse(data),
  );
  revalidatePath(REVALIDATE_PATH);
  return method;
}

export async function deleteShippingMethod(id: string) {
  await requireAdminAuth();
  await ShippingDB.deleteMethod(id);
  revalidatePath(REVALIDATE_PATH);
}

// --- Rates ---

export async function addShippingRate(
  methodId: string,
  data: {
    type: ShippingRateTypeValue;
    price: number;
    min?: number;
    max?: number;
    minWeightGrams?: number;
    maxWeightGrams?: number;
    shippingProfileId?: string | null;
    applicationType?: ShippingRateApplicationValue;
    priority?: number;
    zoneId: string;
  },
) {
  await requireAdminAuth();
  const rate = await ShippingDB.addRate(
    methodId,
    shippingRateSchema.parse(data),
  );
  revalidatePath(REVALIDATE_PATH);
  return rate;
}

export async function updateShippingRate(
  id: string,
  data: {
    price?: number;
    min?: number | null;
    max?: number | null;
    minWeightGrams?: number | null;
    maxWeightGrams?: number | null;
    shippingProfileId?: string | null;
    applicationType?: ShippingRateApplicationValue;
    priority?: number;
    isActive?: boolean;
    zoneId?: string | null;
  },
) {
  await requireAdminAuth();
  const parsed = updateShippingRateSchema.parse(data);
  const rate = await ShippingDB.updateRate(
    id,
    {
      ...parsed,
      max: parsed.max,
      min: parsed.min,
      maxWeightGrams: parsed.maxWeightGrams,
      minWeightGrams: parsed.minWeightGrams,
    },
  );
  revalidatePath(REVALIDATE_PATH);
  return rate;
}

export async function deleteShippingRate(id: string) {
  await requireAdminAuth();
  await ShippingDB.deleteRate(id);
  revalidatePath(REVALIDATE_PATH);
}
