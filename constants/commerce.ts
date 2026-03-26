export const PAYMENT_STATUS = {
  FAILED: "FAILED",
  PAID: "PAID",
  PENDING: "PENDING",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const FULFILLMENT_STATUS = {
  FULFILLED: "FULFILLED",
  UNFULFILLED: "UNFULFILLED",
} as const;

export type FulfillmentStatus =
  (typeof FULFILLMENT_STATUS)[keyof typeof FULFILLMENT_STATUS];
