import type { Prisma } from "@prisma/client";

type NumberLike = number | string | Prisma.Decimal | null | undefined;

export type ShippingProfileContext = {
  code: string;
  handlingFee?: NumberLike;
  id: string;
  name: string;
};

export type ShippingQuoteContext = {
  profileIds: string[];
  profiles: ShippingProfileContext[];
  shippableItemCount: number;
  subtotal: number;
  totalWeightGrams: number;
};

export type ShippingSelection = {
  code: string;
  cost: number;
  name: string;
};

type ShippingRateInput = {
  applicationType?: string | null;
  id?: string;
  isActive?: boolean;
  maxOrderAmount?: NumberLike;
  maxWeightGrams?: number | null;
  minOrderAmount?: NumberLike;
  minWeightGrams?: number | null;
  price: NumberLike;
  priority?: number | null;
  shippingProfileId?: string | null;
  shippingZoneId?: string | null;
  type: string;
};

type ShippingMethodInput = {
  code: string;
  description?: string | null;
  id: string;
  maxDeliveryDays?: number | null;
  minDeliveryDays?: number | null;
  name: string;
  providerCode?: string | null;
  providerServiceCode?: string | null;
  rates?: ShippingRateInput[];
  sortOrder?: number | null;
  sourceType?: string | null;
};

function toNumber(value: NumberLike) {
  return Number(value || 0);
}

function normalizeRate(rate: ShippingRateInput) {
  return {
    ...rate,
    applicationType: rate.applicationType || "BASE",
    maxOrderAmount:
      rate.maxOrderAmount === null || rate.maxOrderAmount === undefined
        ? null
        : toNumber(rate.maxOrderAmount),
    maxWeightGrams:
      rate.maxWeightGrams === null || rate.maxWeightGrams === undefined
        ? null
        : Number(rate.maxWeightGrams),
    minOrderAmount:
      rate.minOrderAmount === null || rate.minOrderAmount === undefined
        ? null
        : toNumber(rate.minOrderAmount),
    minWeightGrams:
      rate.minWeightGrams === null || rate.minWeightGrams === undefined
        ? null
        : Number(rate.minWeightGrams),
    price: toNumber(rate.price),
    priority: rate.priority ?? 0,
  };
}

function rateMatchesContext(
  rate: ReturnType<typeof normalizeRate>,
  context: ShippingQuoteContext,
  zoneId?: string | null,
) {
  const zoneMatches =
    !zoneId || !rate.shippingZoneId || rate.shippingZoneId === zoneId;
  if (!zoneMatches) {
    return false;
  }

  const subtotalMatches =
    (rate.minOrderAmount === null || context.subtotal >= rate.minOrderAmount) &&
    (rate.maxOrderAmount === null || context.subtotal <= rate.maxOrderAmount);
  if (!subtotalMatches) {
    return false;
  }

  const weightMatches =
    (rate.minWeightGrams === null ||
      context.totalWeightGrams >= rate.minWeightGrams) &&
    (rate.maxWeightGrams === null ||
      context.totalWeightGrams <= rate.maxWeightGrams);

  if (!weightMatches) {
    return false;
  }

  if (!rate.shippingProfileId) {
    return true;
  }

  return context.profileIds.includes(rate.shippingProfileId);
}

function pickBaseRate(
  rates: ReturnType<typeof normalizeRate>[],
  context: ShippingQuoteContext,
) {
  const profileAwareBaseRates =
    context.profileIds.length === 1
      ? rates.filter(
          (rate) =>
            !rate.shippingProfileId ||
            rate.shippingProfileId === context.profileIds[0],
        )
      : rates.filter((rate) => !rate.shippingProfileId);

  return (
    profileAwareBaseRates[0] ||
    rates.find((rate) => !rate.shippingProfileId) ||
    rates[0] ||
    null
  );
}

function calculateProfileSurcharges(
  rates: ReturnType<typeof normalizeRate>[],
  context: ShippingQuoteContext,
) {
  const surchargeRates = rates.filter(
    (rate) => rate.applicationType === "SURCHARGE",
  );
  if (surchargeRates.length === 0) {
    return 0;
  }

  const totalProfileRate = context.profileIds.reduce((sum, profileId) => {
    const matchingProfileRate =
      surchargeRates.find((rate) => rate.shippingProfileId === profileId) || null;
    return sum + (matchingProfileRate?.price || 0);
  }, 0);

  const globalSurcharge = surchargeRates
    .filter((rate) => !rate.shippingProfileId)
    .reduce((sum, rate) => sum + rate.price, 0);

  const profileHandlingFee = context.profiles.reduce(
    (sum, profile) => sum + toNumber(profile.handlingFee),
    0,
  );

  return totalProfileRate + globalSurcharge + profileHandlingFee;
}

export function formatDeliveryEstimate(
  minDeliveryDays?: number | null,
  maxDeliveryDays?: number | null,
) {
  if (
    minDeliveryDays === null ||
    minDeliveryDays === undefined ||
    minDeliveryDays <= 0
  ) {
    return null;
  }

  if (
    maxDeliveryDays === null ||
    maxDeliveryDays === undefined ||
    maxDeliveryDays <= minDeliveryDays
  ) {
    return `${minDeliveryDays} business day${minDeliveryDays === 1 ? "" : "s"}`;
  }

  return `${minDeliveryDays}-${maxDeliveryDays} business days`;
}

export function buildShippingQuoteContext(input: {
  profiles: ShippingProfileContext[];
  shippableItemCount: number;
  subtotal: number;
  totalWeightGrams: number;
}) {
  return {
    profileIds: input.profiles.map((profile) => profile.id),
    profiles: input.profiles,
    shippableItemCount: input.shippableItemCount,
    subtotal: input.subtotal,
    totalWeightGrams: input.totalWeightGrams,
  } satisfies ShippingQuoteContext;
}

export function resolveShippingQuote(
  method: ShippingMethodInput,
  context: ShippingQuoteContext,
  zoneId?: string | null,
) {
  const activeRates = (method.rates || [])
    .filter((rate) => rate.isActive !== false)
    .map(normalizeRate)
    .filter((rate) => rateMatchesContext(rate, context, zoneId))
    .sort((left, right) => left.priority - right.priority);

  if (context.shippableItemCount === 0) {
    return {
      calculatedPrice: 0,
      code: method.code,
      deliveryEstimateLabel: formatDeliveryEstimate(
        method.minDeliveryDays,
        method.maxDeliveryDays,
      ),
      description: method.description,
      freeAbove: 0,
      id: method.id,
      matchedRateId: null,
      matchedRateType: null,
      maxDeliveryDays: method.maxDeliveryDays ?? null,
      minDeliveryDays: method.minDeliveryDays ?? null,
      name: method.name,
      providerCode: method.providerCode || null,
      providerServiceCode: method.providerServiceCode || null,
      sortOrder: method.sortOrder ?? 0,
      sourceType: method.sourceType || "MANUAL",
      totalWeightGrams: 0,
    };
  }

  if (activeRates.length === 0) {
    return null;
  }

  const baseRates = activeRates.filter((rate) => rate.applicationType === "BASE");
  const baseRate = pickBaseRate(baseRates, context);
  if (!baseRate) {
    return null;
  }

  const freeAbove = baseRates
    .filter(
      (rate) =>
        rate.price === 0 &&
        rate.minOrderAmount !== null &&
        (rate.maxOrderAmount === null || context.subtotal <= rate.maxOrderAmount),
    )
    .reduce<number | null>((best, rate) => {
      if (best === null || (rate.minOrderAmount !== null && rate.minOrderAmount < best)) {
        return rate.minOrderAmount;
      }
      return best;
    }, null);

  const surchargeTotal = calculateProfileSurcharges(activeRates, context);
  const calculatedPrice = baseRate.price + surchargeTotal;

  return {
    calculatedPrice,
    code: method.code,
    deliveryEstimateLabel: formatDeliveryEstimate(
      method.minDeliveryDays,
      method.maxDeliveryDays,
    ),
    description: method.description,
    freeAbove,
    id: method.id,
    matchedRateId: baseRate.id || null,
    matchedRateType: baseRate.type || null,
    maxDeliveryDays: method.maxDeliveryDays ?? null,
    minDeliveryDays: method.minDeliveryDays ?? null,
    name: method.name,
    providerCode: method.providerCode || null,
    providerServiceCode: method.providerServiceCode || null,
    sortOrder: method.sortOrder ?? 0,
    sourceType: method.sourceType || "MANUAL",
    surchargeTotal,
    totalWeightGrams: context.totalWeightGrams,
  };
}

export function rankShippingQuotes<T extends ReturnType<typeof resolveShippingQuote>>(
  quotes: T[],
) {
  const validQuotes = quotes.filter(Boolean) as NonNullable<T>[];
  if (validQuotes.length === 0) {
    return [];
  }

  const recommendedId = [...validQuotes].sort((left, right) => {
    if (left.calculatedPrice !== right.calculatedPrice) {
      return left.calculatedPrice - right.calculatedPrice;
    }

    const leftDays = left.minDeliveryDays ?? Number.MAX_SAFE_INTEGER;
    const rightDays = right.minDeliveryDays ?? Number.MAX_SAFE_INTEGER;
    if (leftDays !== rightDays) {
      return leftDays - rightDays;
    }

    return left.sortOrder - right.sortOrder;
  })[0]?.id;

  return validQuotes
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      if (left.calculatedPrice !== right.calculatedPrice) {
        return left.calculatedPrice - right.calculatedPrice;
      }

      const leftDays = left.minDeliveryDays ?? Number.MAX_SAFE_INTEGER;
      const rightDays = right.minDeliveryDays ?? Number.MAX_SAFE_INTEGER;
      return leftDays - rightDays;
    })
    .map((quote) => ({
      ...quote,
      isRecommended: quote.id === recommendedId,
    }));
}

export function getPreferredShippingSelection(
  methods: Array<{
    calculatedPrice: number;
    code: string;
    name: string;
  }>,
  currentCode?: string | null,
): ShippingSelection | null {
  if (methods.length === 0) {
    return null;
  }

  const selected =
    (currentCode
      ? methods.find((method) => method.code === currentCode)
      : null) || methods[0];

  return {
    code: selected.code,
    cost: Number(selected.calculatedPrice || 0),
    name: selected.name,
  };
}
