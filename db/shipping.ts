import { Prisma, ShippingRateType } from "@prisma/client";
import prisma from "./prisma";

type ShippingPresetCode = "gcc" | "india";

const STARTER_PROFILE_DEFINITIONS = [
  {
    code: "STANDARD",
    description: "Default profile for most catalog items.",
    handlingFee: 0,
    isDefault: true,
    name: "Standard",
  },
  {
    code: "HEAVY",
    description: "Use for bulky or higher-cost parcels.",
    handlingFee: 0,
    isDefault: false,
    name: "Heavy",
  },
  {
    code: "FRAGILE",
    description: "Use when items need extra packaging or handling.",
    handlingFee: 0,
    isDefault: false,
    name: "Fragile",
  },
] as const;

const SHIPPING_PRESET_CONFIG: Record<
  ShippingPresetCode,
  {
    methods: Array<{
      code: string;
      description: string;
      isActive: boolean;
      maxDeliveryDays: number;
      minDeliveryDays: number;
      name: string;
      providerCode?: string;
      providerServiceCode?: string;
      sortOrder: number;
      sourceType: "MANUAL" | "CARRIER";
    }>;
    zones: Array<{
      areas: Array<{ country: string; state: string }>;
      name: string;
    }>;
  }
> = {
  gcc: {
    methods: [
      {
        code: "gcc_standard",
        description:
          "Starter manual method for standard GCC delivery. Add rates, then activate.",
        isActive: false,
        maxDeliveryDays: 4,
        minDeliveryDays: 2,
        name: "Standard Delivery",
        sortOrder: 0,
        sourceType: "MANUAL",
      },
      {
        code: "gcc_express",
        description:
          "Starter manual method for faster GCC delivery. Add rates, then activate.",
        isActive: false,
        maxDeliveryDays: 2,
        minDeliveryDays: 1,
        name: "Express Delivery",
        sortOrder: 1,
        sourceType: "MANUAL",
      },
      {
        code: "aramex_gcc",
        description:
          "Carrier-ready method. Connect Aramex credentials, confirm service mapping, then activate.",
        isActive: false,
        maxDeliveryDays: 3,
        minDeliveryDays: 1,
        name: "Aramex Express",
        providerCode: "aramex",
        providerServiceCode: "express",
        sortOrder: 2,
        sourceType: "CARRIER",
      },
      {
        code: "imile_gcc",
        description:
          "Carrier-ready method for UAE and Saudi workflows. Connect iMile and activate after testing.",
        isActive: false,
        maxDeliveryDays: 3,
        minDeliveryDays: 1,
        name: "iMile Standard",
        providerCode: "imile",
        providerServiceCode: "standard",
        sortOrder: 3,
        sourceType: "CARRIER",
      },
    ],
    zones: [
      {
        areas: [{ country: "AE", state: "*" }],
        name: "UAE Domestic",
      },
      {
        areas: [
          { country: "SA", state: "*" },
          { country: "KW", state: "*" },
          { country: "QA", state: "*" },
          { country: "BH", state: "*" },
          { country: "OM", state: "*" },
        ],
        name: "Rest of GCC",
      },
    ],
  },
  india: {
    methods: [
      {
        code: "india_standard",
        description:
          "Starter manual method for standard India delivery. Add rates, then activate.",
        isActive: false,
        maxDeliveryDays: 5,
        minDeliveryDays: 2,
        name: "Standard Delivery",
        sortOrder: 0,
        sourceType: "MANUAL",
      },
      {
        code: "india_express",
        description:
          "Starter manual method for fast India delivery. Add rates, then activate.",
        isActive: false,
        maxDeliveryDays: 2,
        minDeliveryDays: 1,
        name: "Express Delivery",
        sortOrder: 1,
        sourceType: "MANUAL",
      },
      {
        code: "shiprocket_surface",
        description:
          "Aggregator-ready method. Connect Shiprocket, verify serviceability and rates, then activate.",
        isActive: false,
        maxDeliveryDays: 5,
        minDeliveryDays: 2,
        name: "Shiprocket Surface",
        providerCode: "shiprocket",
        providerServiceCode: "surface",
        sortOrder: 2,
        sourceType: "CARRIER",
      },
      {
        code: "delhivery_surface",
        description:
          "Carrier-ready method for domestic India shipping. Connect Delhivery and activate after testing.",
        isActive: false,
        maxDeliveryDays: 4,
        minDeliveryDays: 2,
        name: "Delhivery Surface",
        providerCode: "delhivery",
        providerServiceCode: "surface",
        sortOrder: 3,
        sourceType: "CARRIER",
      },
      {
        code: "bluedart_priority",
        description:
          "Carrier-ready method for priority India shipments. Connect Blue Dart before activating.",
        isActive: false,
        maxDeliveryDays: 2,
        minDeliveryDays: 1,
        name: "Blue Dart Priority",
        providerCode: "bluedart",
        providerServiceCode: "domestic_priority",
        sortOrder: 4,
        sourceType: "CARRIER",
      },
    ],
    zones: [
      {
        areas: [{ country: "IN", state: "*" }],
        name: "India Domestic",
      },
    ],
  },
};

async function ensureStarterProfiles(tx: Prisma.TransactionClient) {
  const existingDefault = await tx.shippingProfile.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });

  const profiles = new Map<string, { id: string; isDefault: boolean }>();

  for (const definition of STARTER_PROFILE_DEFINITIONS) {
    const existing = await tx.shippingProfile.findUnique({
      where: { code: definition.code },
      select: { id: true, isDefault: true },
    });

    if (existing) {
      if (!existingDefault && definition.isDefault && !existing.isDefault) {
        await tx.shippingProfile.update({
          where: { id: existing.id },
          data: { isDefault: true },
        });
        profiles.set(definition.code, { ...existing, isDefault: true });
      } else {
        profiles.set(definition.code, existing);
      }
      continue;
    }

    const created = await tx.shippingProfile.create({
      data: {
        ...definition,
        isDefault: definition.isDefault && !existingDefault,
      },
      select: { id: true, isDefault: true },
    });

    profiles.set(definition.code, created);
  }

  return profiles;
}

export class ShippingDB {
  static async getDefaultProfile() {
    return prisma.shippingProfile.findFirst({
      where: { isDefault: true },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "asc" }],
    });
  }

  static async listProfiles() {
    return prisma.shippingProfile.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  }

  static async createProfile(data: {
    code: string;
    description?: string;
    handlingFee?: number;
    isDefault?: boolean;
    name: string;
  }) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.shippingProfile.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.shippingProfile.create({
        data: {
          code: data.code,
          description: data.description,
          handlingFee: data.handlingFee ?? 0,
          isDefault: data.isDefault ?? false,
          name: data.name,
        },
      });
    });
  }

  static async updateProfile(
    id: string,
    data: {
      code?: string;
      description?: string | null;
      handlingFee?: number;
      isDefault?: boolean;
      name?: string;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.shippingProfile.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.shippingProfile.update({
        where: { id },
        data,
      });
    });
  }

  static async deleteProfile(id: string) {
    return prisma.shippingProfile.delete({
      where: { id },
    });
  }

  static async listZones() {
    return prisma.shippingZone.findMany({
      include: {
        areas: true,
        methods: {
          include: {
            rates: {
              include: {
                shippingProfile: true,
              },
              orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async getZone(id: string) {
    return prisma.shippingZone.findUnique({
      where: { id },
      include: {
        areas: true,
        methods: {
          include: {
            rates: {
              include: {
                shippingProfile: true,
              },
              orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });
  }

  static async findZoneForAddress(
    country: string,
    state?: string,
    city?: string,
    zipCode?: string,
  ) {
    const normalizedCountry = country?.trim();
    if (!normalizedCountry) {
      return null;
    }

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
                  include: {
                    shippingProfile: true,
                  },
                  orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
                },
              },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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

    if (!best?.shippingZone) {
      return null;
    }

    return {
      ...best.shippingZone,
      methods: best.shippingZone.methods.map((method) => ({
        ...method,
        rates: method.rates.filter(
          (rate) =>
            rate.shippingZoneId === best.shippingZone.id ||
            rate.shippingZoneId === null,
        ),
      })),
    };
  }

  static async createZone(data: {
    name: string;
    areas: { country: string; state: string }[];
  }) {
    return prisma.shippingZone.create({
      data: {
        name: data.name,
        areas: {
          create: data.areas,
        },
      },
      include: { areas: true },
    });
  }

  static async updateZone(
    id: string,
    data: { name?: string; areas?: { country: string; state: string }[] },
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.name) {
        await tx.shippingZone.update({
          where: { id },
          data: { name: data.name },
        });
      }

      if (data.areas) {
        await tx.shippingZoneArea.deleteMany({
          where: { shippingZoneId: id },
        });

        await tx.shippingZoneArea.createMany({
          data: data.areas.map((area) => ({
            shippingZoneId: id,
            country: area.country,
            state: area.state,
          })),
        });
      }

      return tx.shippingZone.findUnique({
        where: { id },
        include: { areas: true },
      });
    });
  }

  static async deleteZone(id: string) {
    return prisma.$transaction(async (tx) => {
      const zone = await tx.shippingZone.findUnique({
        where: { id },
        select: {
          id: true,
          methods: {
            select: { id: true },
          },
        },
      });

      if (!zone) {
        return null;
      }

      if (zone.methods.length > 0) {
        await tx.shippingZone.update({
          where: { id },
          data: {
            methods: {
              disconnect: zone.methods.map((method) => ({ id: method.id })),
            },
          },
        });
      }

      await tx.shippingZoneArea.deleteMany({
        where: { shippingZoneId: id },
      });

      await tx.shippingRate.deleteMany({
        where: { shippingZoneId: id },
      });

      return tx.shippingZone.delete({
        where: { id },
      });
    });
  }

  static async createMethod(
    zoneId: string,
    data: {
      name: string;
      code: string;
      description?: string;
      isActive?: boolean;
      sortOrder?: number;
      minDeliveryDays?: number | null;
      maxDeliveryDays?: number | null;
      sourceType?: "MANUAL" | "CARRIER";
      providerCode?: string | null;
      providerServiceCode?: string | null;
    },
  ) {
    return prisma.shippingMethod.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        minDeliveryDays: data.minDeliveryDays ?? null,
        maxDeliveryDays: data.maxDeliveryDays ?? null,
        sourceType: data.sourceType ?? "MANUAL",
        providerCode: data.providerCode ?? null,
        providerServiceCode: data.providerServiceCode ?? null,
        zones: {
          connect: { id: zoneId },
        },
      },
    });
  }

  static async updateMethod(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
      minDeliveryDays?: number | null;
      maxDeliveryDays?: number | null;
      sourceType?: "MANUAL" | "CARRIER";
      providerCode?: string | null;
      providerServiceCode?: string | null;
    },
  ) {
    return prisma.shippingMethod.update({
      where: { id },
      data,
    });
  }

  static async deleteMethod(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.shippingRate.deleteMany({
        where: { shippingMethodId: id },
      });

      return tx.shippingMethod.delete({
        where: { id },
      });
    });
  }

  static async addRate(
    methodId: string,
    data: {
      zoneId?: string;
      type: ShippingRateType;
      price: number;
      min?: number;
      max?: number;
      minWeightGrams?: number;
      maxWeightGrams?: number;
      shippingProfileId?: string | null;
      applicationType?: "BASE" | "SURCHARGE";
      priority?: number;
    },
  ) {
    return prisma.shippingRate.create({
      data: {
        shippingMethodId: methodId,
        shippingZoneId: data.zoneId,
        type: data.type,
        price: data.price,
        minOrderAmount: data.min,
        maxOrderAmount: data.max,
        minWeightGrams: data.minWeightGrams,
        maxWeightGrams: data.maxWeightGrams,
        shippingProfileId: data.shippingProfileId ?? null,
        applicationType: data.applicationType ?? "BASE",
        priority: data.priority ?? 0,
      },
    });
  }

  static async updateRate(
    id: string,
    data: {
      zoneId?: string | null;
      price?: number;
      min?: number | null;
      max?: number | null;
      minWeightGrams?: number | null;
      maxWeightGrams?: number | null;
      shippingProfileId?: string | null;
      applicationType?: "BASE" | "SURCHARGE";
      priority?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.shippingRate.update({
      where: { id },
      data: {
        shippingZoneId: data.zoneId,
        price: data.price,
        minOrderAmount: data.min,
        maxOrderAmount: data.max,
        minWeightGrams: data.minWeightGrams,
        maxWeightGrams: data.maxWeightGrams,
        shippingProfileId: data.shippingProfileId,
        applicationType: data.applicationType,
        priority: data.priority,
        isActive: data.isActive,
      },
    });
  }

  static async deleteRate(id: string) {
    return prisma.shippingRate.delete({
      where: { id },
    });
  }

  static async seedPreset(preset: ShippingPresetCode) {
    return prisma.$transaction(async (tx) => {
      await ensureStarterProfiles(tx);
      const config = SHIPPING_PRESET_CONFIG[preset];
      let createdMethods = 0;
      let createdZones = 0;

      for (const zoneConfig of config.zones) {
        let zone = await tx.shippingZone.findFirst({
          where: { name: zoneConfig.name },
          select: { id: true },
        });

        if (!zone) {
          zone = await tx.shippingZone.create({
            data: {
              name: zoneConfig.name,
              areas: {
                create: zoneConfig.areas,
              },
            },
            select: { id: true },
          });
          createdZones += 1;
        }

        for (const methodConfig of config.methods) {
          const existingMethod = await tx.shippingMethod.findUnique({
            where: { code: methodConfig.code },
            select: {
              id: true,
              zones: {
                where: { id: zone.id },
                select: { id: true },
              },
            },
          });

          if (!existingMethod) {
            await tx.shippingMethod.create({
              data: {
                ...methodConfig,
                zones: {
                  connect: { id: zone.id },
                },
              },
            });
            createdMethods += 1;
            continue;
          }

          if (existingMethod.zones.length === 0) {
            await tx.shippingMethod.update({
              where: { id: existingMethod.id },
              data: {
                zones: {
                  connect: { id: zone.id },
                },
              },
            });
          }
        }
      }

      return {
        createdMethods,
        createdZones,
      };
    });
  }
}
