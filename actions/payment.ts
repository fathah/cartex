"use server";

import { PaymentDB } from "@/db/payment";
import { PaymentMethodType, GatewayEnvironment } from "@prisma/client";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATH = "/admin/settings";

// --- Methods ---

export async function getPaymentMethods() {
  return await PaymentDB.listMethods();
}

// Countries where COD is allowed
// Countries where COD is allowed
const COD_ALLOWED_COUNTRIES = ["AE", "SA", "IN", "KW", "BH", "OM", "QA"];
// Minimum order total for COD
const COD_MIN_ORDER = 0;

/**
 * Context-aware payment method filtering.
 * - Filters COD to domestic countries only
 * - Adds codFee for COD methods (FLAT or PERCENTAGE)
 * - Returns only active + eligible methods
 */
export async function getPaymentMethodsForCheckout(
  country: string,
  subtotal: number,
) {
  const allMethods = await PaymentDB.listMethods();

  return allMethods
    .filter((m: any) => m.isActive)
    .map((method: any) => {
      const isCOD = method.type === "COD";

      // COD eligibility: domestic country + above minimum order
      if (isCOD) {
        const codAllowed = COD_ALLOWED_COUNTRIES.includes(
          country.toUpperCase(),
        );
        const meetsMinimum = subtotal >= COD_MIN_ORDER;

        if (!codAllowed || !meetsMinimum) {
          return null; // Filter out
        }
      }

      // Calculate Fee
      let feeAmount = 0;
      let feeLabel = method.feeLabel || null;

      if (method.fee && Number(method.fee) > 0) {
        if (method.feeType === "PERCENTAGE") {
          feeAmount = (subtotal * Number(method.fee)) / 100;
          if (!feeLabel) feeLabel = `${method.fee}% fee`;
        } else {
          // FLAT
          feeAmount = Number(method.fee);
          if (!feeLabel) feeLabel = `+${feeAmount} fee`;
        }
      }

      return {
        ...method,
        paymentFee: feeAmount,
        paymentFeeLabel: feeLabel,
      };
    })
    .filter(Boolean);
}

export async function createPaymentMethod(data: {
  name: string;
  code: string;
  type: PaymentMethodType;
  description?: string;
  fee?: number;
  feeLabel?: string;
  feeType?: string;
}) {
  const method = await PaymentDB.createMethod(data);
  revalidatePath(REVALIDATE_PATH);
  return method;
}

export async function updatePaymentMethod(
  id: string,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
    gatewayIds?: string[];
    fee?: number;
    feeLabel?: string;
    feeType?: string;
  },
) {
  const method = await PaymentDB.updateMethod(id, data);

  revalidatePath(REVALIDATE_PATH);
  return method;
}

export async function deletePaymentMethod(id: string) {
  await PaymentDB.deleteMethod(id);
  revalidatePath(REVALIDATE_PATH);
}

// --- Gateways ---

export async function getPaymentGateways() {
  return await PaymentDB.listGateways();
}

export async function createPaymentGateway(data: {
  name: string;
  code: string;
  environment: GatewayEnvironment;
  config: any;
}) {
  const gateway = await PaymentDB.createGateway(data);
  revalidatePath(REVALIDATE_PATH);
  return gateway;
}

export async function updatePaymentGateway(
  id: string,
  data: {
    name?: string;
    environment?: GatewayEnvironment;
    config?: any;
    isActive?: boolean;
  },
) {
  const gateway = await PaymentDB.updateGateway(id, data);
  revalidatePath(REVALIDATE_PATH);
  return gateway;
}

export async function deletePaymentGateway(id: string) {
  await PaymentDB.deleteGateway(id);
  revalidatePath(REVALIDATE_PATH);
}
