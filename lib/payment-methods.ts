import { PaymentMethodType } from "@prisma/client";

export const CHECKOUT_PAYMENT_METHODS = {
  COD: {
    code: "COD",
    defaultName: "Cash on Delivery",
    type: PaymentMethodType.COD,
  },
  ONLINE: {
    code: "ONLINE",
    defaultName: "Online Payment",
    type: PaymentMethodType.CARD,
  },
} as const;

export const CHECKOUT_PAYMENT_METHOD_LABELS: Record<string, string> = {
  [CHECKOUT_PAYMENT_METHODS.COD.code]: CHECKOUT_PAYMENT_METHODS.COD.defaultName,
  [CHECKOUT_PAYMENT_METHODS.ONLINE.code]:
    CHECKOUT_PAYMENT_METHODS.ONLINE.defaultName,
};

const COD_ALLOWED_COUNTRIES = ["AE", "SA", "IN", "KW", "BH", "OM", "QA"];
const COD_MIN_ORDER = 0;

type PaymentMethodLike = {
  code?: string | null;
  gateways?: Array<{ code: string; id: string; isActive?: boolean }>;
  type: PaymentMethodType;
};

export function getCheckoutPaymentMethodLabel(code: string) {
  return (
    CHECKOUT_PAYMENT_METHOD_LABELS[code] ||
    code
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function isPaymentMethodEligibleForCheckout(
  method: PaymentMethodLike,
  country: string,
  subtotal: number,
) {
  if (method.type !== PaymentMethodType.COD) {
    return true;
  }

  const normalizedCountry = country.trim().toUpperCase();
  const codAllowed = COD_ALLOWED_COUNTRIES.includes(normalizedCountry);
  const meetsMinimum = subtotal >= COD_MIN_ORDER;

  if (!codAllowed || !meetsMinimum) {
    return false;
  }

  return true;
}
