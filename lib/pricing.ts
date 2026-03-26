import type { Prisma } from "@prisma/client";

type TaxBreakdownInput = {
  cartSum: number;
  taxMode: string;
  taxRate: number;
};

type ShippingRateLike = {
  isActive?: boolean;
  maxOrderAmount?: number | string | Prisma.Decimal | null;
  minOrderAmount?: number | string | Prisma.Decimal | null;
  price: number | string | Prisma.Decimal;
  priority?: number | null;
  shippingZoneId?: string | null;
  type: string;
};

type PaymentFeeLike = {
  fee?: number | string | Prisma.Decimal | null;
  feeType?: string | null;
};

export function calculateTaxBreakdown(input: TaxBreakdownInput) {
  if (input.taxMode === "INCLUSIVE") {
    const subtotal = input.cartSum / (1 + input.taxRate / 100);
    return {
      subtotal,
      taxTotal: input.cartSum - subtotal,
    };
  }

  return {
    subtotal: input.cartSum,
    taxTotal: (input.cartSum * input.taxRate) / 100,
  };
}

export function calculatePaymentFee(
  paymentMethod: PaymentFeeLike | null,
  subtotal: number,
) {
  if (!paymentMethod?.fee || Number(paymentMethod.fee) <= 0) {
    return 0;
  }

  if (paymentMethod.feeType === "PERCENTAGE") {
    return (subtotal * Number(paymentMethod.fee)) / 100;
  }

  return Number(paymentMethod.fee);
}

export function calculateShippingFromRates(
  rates: ShippingRateLike[],
  subtotal: number,
  zoneId?: string | null,
) {
  const activeRates = rates
    .filter((rate) => rate.isActive !== false)
    .filter(
      (rate) => !zoneId || !rate.shippingZoneId || rate.shippingZoneId === zoneId,
    )
    .sort((left, right) => (left.priority || 0) - (right.priority || 0));

  let calculatedPrice: number | null = null;
  let freeAbove: number | null = null;

  for (const rate of activeRates) {
    const ratePrice = Number(rate.price);
    const min = rate.minOrderAmount ? Number(rate.minOrderAmount) : null;
    const max = rate.maxOrderAmount ? Number(rate.maxOrderAmount) : null;

    switch (rate.type) {
      case "FLAT":
      case "WEIGHT":
        if (calculatedPrice === null) {
          calculatedPrice = ratePrice;
        }
        break;
      case "CONDITIONAL":
      case "PRICE": {
        if (min !== null && ratePrice === 0) {
          if (freeAbove === null || min < freeAbove) {
            freeAbove = min;
          }
        }

        const inMin = min === null || subtotal >= min;
        const inMax = max === null || subtotal <= max;
        if (inMin && inMax) {
          if (calculatedPrice === null || ratePrice < calculatedPrice) {
            calculatedPrice = ratePrice;
          }
        }
        break;
      }
    }
  }

  if (calculatedPrice === null && activeRates.length > 0) {
    calculatedPrice = Number(activeRates[0].price);
  }

  return {
    calculatedPrice: calculatedPrice ?? 0,
    freeAbove,
  };
}
