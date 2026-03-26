"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { GatewayEnvironment, PaymentMethodType } from "@prisma/client";
import { PaymentDB } from "@/db/payment";
import { calculatePaymentFee } from "@/lib/pricing";
import {
  buildGatewayAdminDto,
  GATEWAY_SECRET_KEYS,
  mergeGatewayConfigForSave,
} from "@/services/gateway-config";
import { requireAdminAuth } from "@/services/zauth";

const REVALIDATE_PATH = "/admin/settings";
const COD_ALLOWED_COUNTRIES = ["AE", "SA", "IN", "KW", "BH", "OM", "QA"];
const COD_MIN_ORDER = 0;

const paymentMethodSchema = z.object({
  code: z.string().trim().min(1),
  description: z.string().trim().optional(),
  fee: z.coerce.number().min(0).optional(),
  feeLabel: z.string().trim().optional(),
  feeType: z.string().trim().default("FLAT"),
  gatewayIds: z.array(z.string()).optional(),
  name: z.string().trim().min(1),
  type: z.nativeEnum(PaymentMethodType),
});

const paymentGatewaySchema = z.object({
  code: z.string().trim().min(1),
  config: z.record(z.string(), z.string().trim()).default({}),
  environment: z.nativeEnum(GatewayEnvironment),
  isActive: z.boolean().default(true),
  name: z.string().trim().min(1),
});

export async function getPaymentMethods() {
  await requireAdminAuth();
  return PaymentDB.listMethods();
}

export async function getPaymentMethodsForCheckout(
  country: string,
  subtotal: number,
) {
  const allMethods = await PaymentDB.listMethods();

  return allMethods
    .filter((method) => method.isActive)
    .map((method) => {
      const isCOD = method.type === PaymentMethodType.COD;
      if (isCOD) {
        const codAllowed = COD_ALLOWED_COUNTRIES.includes(country.toUpperCase());
        const meetsMinimum = subtotal >= COD_MIN_ORDER;
        if (!codAllowed || !meetsMinimum) {
          return null;
        }
      }

      const paymentFee = calculatePaymentFee(method, subtotal);
      const paymentFeeLabel =
        method.feeLabel ||
        (paymentFee > 0
          ? method.feeType === "PERCENTAGE"
            ? `${method.fee}% fee`
            : `+${paymentFee} fee`
          : null);

      return {
        code: method.code,
        gatewayCodes: method.gateways
          .filter((gateway) => gateway.isActive)
          .map((gateway) => gateway.code),
        id: method.id,
        name: method.name,
        paymentFee,
        paymentFeeLabel,
        type: method.type,
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
  gatewayIds?: string[];
}) {
  await requireAdminAuth();
  const parsed = paymentMethodSchema.parse(data);
  const method = await PaymentDB.createMethod(parsed);
  if (parsed.gatewayIds?.length) {
    await PaymentDB.updateMethod(method.id, {
      gatewayIds: parsed.gatewayIds,
    });
  }
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
  await requireAdminAuth();
  const method = await PaymentDB.updateMethod(id, data);
  revalidatePath(REVALIDATE_PATH);
  return method;
}

export async function deletePaymentMethod(id: string) {
  await requireAdminAuth();
  await PaymentDB.deleteMethod(id);
  revalidatePath(REVALIDATE_PATH);
}

export async function getActiveGatewaysForCheckout(): Promise<
  { id: string; code: string; name: string; environment: string }[]
> {
  const gateways = await PaymentDB.listGateways();
  return gateways
    .filter((gateway) => gateway.isActive)
    .map((gateway) => ({
      code: gateway.code,
      environment: gateway.environment,
      id: gateway.id,
      name: gateway.name,
    }));
}

export async function getPaymentGateways() {
  await requireAdminAuth();
  const gateways = await PaymentDB.listGateways();
  return Promise.all(gateways.map((gateway) => buildGatewayAdminDto(gateway)));
}

export async function createPaymentGateway(data: {
  name: string;
  code: string;
  environment: GatewayEnvironment;
  config: Record<string, string>;
  isActive?: boolean;
}) {
  await requireAdminAuth();
  const parsed = paymentGatewaySchema.parse(data);
  const secretKeys = GATEWAY_SECRET_KEYS[parsed.code] || [];
  const missingSecret = secretKeys.find((key) => !parsed.config[key]);
  if (missingSecret) {
    throw new Error(`${missingSecret} is required`);
  }

  const prepared = await mergeGatewayConfigForSave({
    code: parsed.code,
    config: parsed.config,
  });

  const gateway = await PaymentDB.createGateway({
    code: parsed.code,
    config: prepared.config,
    environment: parsed.environment,
    name: parsed.name,
    secretConfig: prepared.secretConfig,
  });

  if (!parsed.isActive) {
    await PaymentDB.updateGateway(gateway.id, {
      isActive: parsed.isActive,
    });
  }

  revalidatePath(REVALIDATE_PATH);
  return buildGatewayAdminDto(gateway);
}

export async function updatePaymentGateway(
  id: string,
  data: {
    name?: string;
    environment?: GatewayEnvironment;
    config?: Record<string, string>;
    isActive?: boolean;
  },
) {
  await requireAdminAuth();
  const existing = await PaymentDB.listGateways().then((gateways) =>
    gateways.find((gateway) => gateway.id === id),
  );
  if (!existing) {
    throw new Error("Gateway not found");
  }

  const parsed = paymentGatewaySchema.partial().parse(data);
  const prepared = await mergeGatewayConfigForSave({
    code: existing.code,
    config: parsed.config || {},
    existingGateway: existing,
  });

  const gateway = await PaymentDB.updateGateway(id, {
    config: prepared.config,
    environment: parsed.environment,
    isActive: parsed.isActive,
    name: parsed.name,
    secretConfig: prepared.secretConfig,
  });
  revalidatePath(REVALIDATE_PATH);
  return buildGatewayAdminDto(gateway);
}

export async function deletePaymentGateway(id: string) {
  await requireAdminAuth();
  await PaymentDB.deleteGateway(id);
  revalidatePath(REVALIDATE_PATH);
}
