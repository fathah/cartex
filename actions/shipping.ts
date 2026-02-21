"use server";

import { ShippingDB } from "@/db/shipping";
import { ShippingRateType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

const REVALIDATE_PATH = "/admin/settings";

// --- Zones ---

export async function getShippingZones() {
  return await ShippingDB.listZones();
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
      const activeRates = (method.rates || [])
        .filter((r: any) => r.isActive)
        .sort((a: any, b: any) => a.priority - b.priority);

      let calculatedPrice: number | null = null;
      let freeAbove: number | null = null;

      for (const rate of activeRates) {
        const ratePrice = Number(rate.price);
        const min = rate.minOrderAmount ? Number(rate.minOrderAmount) : null;
        const max = rate.maxOrderAmount ? Number(rate.maxOrderAmount) : null;

        switch (rate.type) {
          case "FLAT":
            // Flat rate always applies — use as base if nothing better found
            if (calculatedPrice === null) {
              calculatedPrice = ratePrice;
            }
            break;

          case "CONDITIONAL":
          case "PRICE": {
            // If the rate is explicitly Free, track its minimum threshold for UI hints "Spend $X more"
            if (min !== null && ratePrice === 0) {
              if (freeAbove === null || min < freeAbove) {
                freeAbove = min;
              }
            }

            const inMin = min === null || subtotal >= min;
            const inMax = max === null || subtotal <= max;

            if (inMin && inMax) {
              // We successfully fall into this bucket. If we have overlapping buckets, favor the cheaper rate.
              if (calculatedPrice === null || ratePrice < calculatedPrice) {
                calculatedPrice = ratePrice;
              }
            }
            break;
          }

          case "WEIGHT":
            // Weight-based — fall back to flat price for now
            if (calculatedPrice === null) {
              calculatedPrice = ratePrice;
            }
            break;
        }
      }

      // If no rate matched, fall back to 0 (shouldn't happen with proper data)
      if (calculatedPrice === null && activeRates.length > 0) {
        calculatedPrice = Number(activeRates[0].price);
      }

      return {
        id: method.id,
        name: method.name,
        code: method.code,
        description: method.description,
        calculatedPrice: calculatedPrice ?? 0,
        freeAbove,
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
  const zone = await ShippingDB.createZone({ name, areas });
  revalidatePath(REVALIDATE_PATH);
  return zone;
}

export async function updateShippingZone(
  id: string,
  data: { name?: string; areas?: { country: string; state: string }[] },
) {
  await requireAdminAuth();
  const zone = await ShippingDB.updateZone(id, data);
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
  const method = await ShippingDB.createMethod(zoneId, data);
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
  },
) {
  await requireAdminAuth();
  const rate = await ShippingDB.addRate(methodId, data);
  revalidatePath(REVALIDATE_PATH);
  return rate;
}

export async function updateShippingRate(
  id: string,
  data: { price?: number; min?: number; max?: number; isActive?: boolean },
) {
  await requireAdminAuth();
  const rate = await ShippingDB.updateRate(id, data);
  revalidatePath(REVALIDATE_PATH);
  return rate;
}

export async function deleteShippingRate(id: string) {
  await requireAdminAuth();
  await ShippingDB.deleteRate(id);
  revalidatePath(REVALIDATE_PATH);
}
