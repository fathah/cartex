import prisma from './prisma';
import { ShippingRateType, Prisma } from '@prisma/client';

export class ShippingDB {
  // --- Zones ---

  static async listZones() {
    return await prisma.shippingZone.findMany({
      include: {
        areas: true,
        methods: {
          include: {
            rates: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async getZone(id: string) {
    return await prisma.shippingZone.findUnique({
      where: { id },
      include: {
        areas: true,
        methods: {
          include: {
            rates: true
          }
        }
      }
    });
  }

  static async findZoneForAddress(
    country: string,
    state?: string,
    city?: string,
    zipCode?: string,
  ) {
    const normalizedCountry = country?.trim();
    if (!normalizedCountry) return null;

    const areas = await prisma.shippingZoneArea.findMany({
      where: {
        country: normalizedCountry,
      },
      include: {
        shippingZone: {
          include: {
            methods: {
              include: {
                rates: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    });

    const normalizedState = state?.trim() || "";
    const normalizedCity = city?.trim() || "";
    const normalizedZip = zipCode?.trim() || "";

    const isWildcard = (value?: string | null) =>
      !value || value === "*" || value.trim() === "";

    let best: (typeof areas)[number] | null = null;
    let bestScore = -1;

    for (const area of areas) {
      const stateMatch =
        isWildcard(area.state) || area.state === normalizedState;
      const cityMatch = isWildcard(area.city) || area.city === normalizedCity;
      const zipMatch =
        isWildcard(area.zipCode) || area.zipCode === normalizedZip;

      if (!stateMatch || !cityMatch || !zipMatch) {
        continue;
      }

      const score =
        (isWildcard(area.state) ? 0 : 1) +
        (isWildcard(area.city) ? 0 : 1) +
        (isWildcard(area.zipCode) ? 0 : 1);

      if (score > bestScore) {
        bestScore = score;
        best = area;
      }
    }

    return best?.shippingZone || null;
  }

  static async createZone(data: { name: string; areas: { country: string; state: string }[] }) {
    return await prisma.shippingZone.create({
      data: {
        name: data.name,
        areas: {
          create: data.areas
        }
      },
      include: { areas: true }
    });
  }

  static async updateZone(id: string, data: { name?: string; areas?: { country: string; state: string }[] }) {
    return await prisma.$transaction(async (tx) => {
      // Update basic info
      if (data.name) {
        await tx.shippingZone.update({
          where: { id },
          data: { name: data.name }
        });
      }

      // Update areas if provided
      if (data.areas) {
        // Delete existing areas
        await tx.shippingZoneArea.deleteMany({
          where: { shippingZoneId: id }
        });

        // Create new areas
        await tx.shippingZoneArea.createMany({
          data: data.areas.map(area => ({
            shippingZoneId: id,
            country: area.country,
            state: area.state
          }))
        });
      }

      return tx.shippingZone.findUnique({
        where: { id },
        include: { areas: true }
      });
    });
  }

  static async deleteZone(id: string) {
    return await prisma.shippingZone.delete({
      where: { id }
    });
  }

  // --- Methods ---

  static async createMethod(zoneId: string, data: { name: string; code: string; description?: string }) {
    return await prisma.shippingMethod.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        zones: {
          connect: { id: zoneId }
        }
      }
    });
  }
  
  // Connect an existing method to a zone, or create new specific method structure?
  // The schema has Many-to-Many between Zone and Method ("MethodZones").
  // Usually methods like "FedEx Express" are global definitions, but rates are specific?
  // Wait, schema says:
  // model ShippingMethod { ... zones ShippingZone[] @relation("MethodZones") ... rates ShippingRate[] }
  // model ShippingRate { ... shippingMethodId String ... }
  // This implies Rates are children of Method.
  // If Rates are children of Method, and Method is shared across zones... 
  // Then the SAME rate applies to ALL zones connected to that method?
  // That seems wrong. usually rates depend on the zone.
  // "Standard Shipping" for "Domestic" might be $5.
  // "Standard Shipping" for "International" might be $20.
  // If `ShippingRate` does NOT have a `zoneId`, then `ShippingMethod` must be unique per Zone if rates differ?
  // Or `ShippingRate` should have been related to Zone?
  // Let's re-read schema provided by user in Step 374.
  /*
    model ShippingMethod {
      rates ShippingRate[]
      zones ShippingZone[] @relation("MethodZones")
    }
    model ShippingRate {
      shippingMethodId String
      // No zone ID here.
    }
  */
  // This schema implies that a ShippingMethod (with its fixed rates) can be available in multiple zones.
  // e.g. "Flat Rate Global $20" -> Method.
  // If I want different prices for different zones, I need different methods? e.g. "US Standard", "EU Standard".
  // OR, I misread the intention. 
  // Maybe the User intends to create a unique Method instance for each Zone?
  // "code" is unique in ShippingMethod: `code String @unique`.
  // This strongly suggests Methods are global/shared definitions (like a singleton "DHL Express").
  // If `code` is unique, I can't have "Standard" for US and "Standard" for EU as separate rows if they share code "standard".
  // Unless I generate unique codes like "standard-us", "standard-eu".
  
  // Given the schema constraints:
  // 1. Method has unique Code.
  // 2. Rates belong to Method.
  // 3. Method belongs to many Zones.
  
  // This fits a model where you define "Services" (Methods) globally, and they have defined Rates.
  // note: Adding "Standard Shipping" to "US Zone" and "EU Zone" would mean they share the exact same Price logic if they share the Method record.
  // If the user wants different prices, they MUST create different Methods (e.g. "US Standard" vs "EU Standard").
  
  // Creating a new method *inside* a zone context in UI usually implies "I want to configure shipping for THIS zone".
  // If I create a method "Standard" in Zone A, and then "Standard" in Zone B...
  // If I try to reuse the code "standard", it will fail unique constraint.
  // So I should auto-generate codes or ask user for code?
  // Or maybe methods are re-usable?
  
  // Let's implement `createMethod` to create a NEW method definition.
  // And `addMethodToZone` to connect existing?
  // Or just assume for this "Lite" settings UI, we might create unique methods per zone implicitly?
  // e.g. code = `zone_${zoneId}_method_${random}`?
  // OR ask user for distinct codes.
  
  // For now, I will implement `createMethod` which creates a method and connects it to the passed zone.
  
  static async deleteMethod(id: string) {
    return await prisma.shippingMethod.delete({
      where: { id }
    });
  }
  
  // --- Rates ---

  static async addRate(methodId: string, data: { 
    type: ShippingRateType; 
    price: number; 
    min?: number; 
    max?: number; 
  }) {
    return await prisma.shippingRate.create({
      data: {
        shippingMethodId: methodId,
        type: data.type,
        price: data.price,
        minOrderAmount: data.min,
        maxOrderAmount: data.max,
      }
    });
  }

  static async updateRate(id: string, data: { price?: number; min?: number; max?: number, isActive?: boolean }) {
    return await prisma.shippingRate.update({
      where: { id },
      data: {
        price: data.price,
        minOrderAmount: data.min,
        maxOrderAmount: data.max,
        isActive: data.isActive
      }
    });
  }

  static async deleteRate(id: string) {
    return await prisma.shippingRate.delete({
      where: { id }
    });
  }
}
