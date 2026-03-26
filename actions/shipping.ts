"use server";

import { z } from "zod";
import { ShippingDB } from "@/db/shipping";
import { ShippingRateType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";
import { calculateShippingFromRates } from "@/lib/pricing";

const REVALIDATE_PATH = "/admin/settings";
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
  name: z.string().trim().min(1),
});

const shippingRateSchema = z.object({
  max: z.number().nonnegative().optional(),
  min: z.number().nonnegative().optional(),
  price: z.number().nonnegative(),
  type: z.nativeEnum(ShippingRateType),
  zoneId: z.string().trim().min(1),
});

const updateShippingRateSchema = z.object({
  isActive: z.boolean().optional(),
  max: z.number().nonnegative().nullable().optional(),
  min: z.number().nonnegative().nullable().optional(),
  price: z.number().nonnegative().optional(),
  zoneId: z.string().trim().min(1).nullable().optional(),
});

// --- Zones ---

export async function getShippingZones() {
  await requireAdminAuth();
  return ShippingDB.listZones();
}

export async function getShippingMethodsForAddress(
  country: string,
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
  return zone.methods;
}

/**
 * Smart shipping method resolution.
 * Resolves the correct rate for each method based on the order subtotal.
 * Returns enriched methods with `calculatedPrice`, `freeAbove`, and `isRecommended`.
 */
export async function getSmartShippingMethods(
  country: string,
  subtotal: number,
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

  const enrichedMethods = zone.methods
    .filter((m: any) => m.isActive)
    .map((method: any) => {
      const pricing = calculateShippingFromRates(
        method.rates || [],
        subtotal,
        zone.id,
      );

      return {
        id: method.id,
        name: method.name,
        code: method.code,
        description: method.description,
        calculatedPrice: pricing.calculatedPrice,
        freeAbove: pricing.freeAbove,
        isRecommended: false,
        rates: method.rates, // keep raw rates for reference
      };
    });

  // Sort: free first, then by price ascending
  enrichedMethods.sort(
    (a: any, b: any) => a.calculatedPrice - b.calculatedPrice,
  );

  // Mark the cheapest as recommended
  if (enrichedMethods.length > 0) {
    enrichedMethods[0].isRecommended = true;
  }

  return enrichedMethods;
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
  data: { name: string; code: string; description?: string },
) {
  await requireAdminAuth();
  const method = await ShippingDB.createMethod(
    zoneId,
    shippingMethodSchema.parse(data),
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
    type: ShippingRateType;
    price: number;
    min?: number;
    max?: number;
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
      max: parsed.max === null ? undefined : parsed.max,
      min: parsed.min === null ? undefined : parsed.min,
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
