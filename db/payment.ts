import prisma from "./prisma";
import { PaymentMethodType, GatewayEnvironment } from "@prisma/client";
import { CHECKOUT_PAYMENT_METHODS } from "@/lib/payment-methods";

function getPaymentMethodInclude() {
  return {
    gateways: {
      select: {
        code: true,
        environment: true,
        id: true,
        isActive: true,
        name: true,
      },
    },
  } as const;
}

async function syncCanonicalCheckoutMethods() {
  const methods = await prisma.paymentMethod.findMany({
    include: getPaymentMethodInclude(),
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });

  let codMethod =
    methods.find((method) => method.code === CHECKOUT_PAYMENT_METHODS.COD.code) ||
    methods.find((method) => method.type === PaymentMethodType.COD) ||
    null;

  if (codMethod) {
    codMethod = await prisma.paymentMethod.update({
      where: { id: codMethod.id },
      data: {
        code: CHECKOUT_PAYMENT_METHODS.COD.code,
        name: CHECKOUT_PAYMENT_METHODS.COD.defaultName,
        type: CHECKOUT_PAYMENT_METHODS.COD.type,
      },
      include: getPaymentMethodInclude(),
    });
  } else {
    codMethod = await prisma.paymentMethod.create({
      data: {
        code: CHECKOUT_PAYMENT_METHODS.COD.code,
        description: "Pay when the order is delivered.",
        isActive: true,
        name: CHECKOUT_PAYMENT_METHODS.COD.defaultName,
        type: CHECKOUT_PAYMENT_METHODS.COD.type,
      },
      include: getPaymentMethodInclude(),
    });
  }

  const onlineCandidates = methods.filter(
    (method) =>
      method.id !== codMethod.id && method.type !== PaymentMethodType.COD,
  );
  let onlineMethod =
    methods.find(
      (method) => method.code === CHECKOUT_PAYMENT_METHODS.ONLINE.code,
    ) ||
    onlineCandidates[0] ||
    null;

  const onlineGatewayIds = Array.from(
    new Set(
      onlineCandidates.flatMap((method) =>
        method.gateways.map((gateway) => gateway.id),
      ),
    ),
  );

  if (onlineMethod) {
    onlineMethod = await prisma.paymentMethod.update({
      where: { id: onlineMethod.id },
      data: {
        code: CHECKOUT_PAYMENT_METHODS.ONLINE.code,
        gateways: {
          set: onlineGatewayIds.map((id) => ({ id })),
        },
        name: CHECKOUT_PAYMENT_METHODS.ONLINE.defaultName,
        type: CHECKOUT_PAYMENT_METHODS.ONLINE.type,
      },
      include: getPaymentMethodInclude(),
    });
  } else {
    onlineMethod = await prisma.paymentMethod.create({
      data: {
        code: CHECKOUT_PAYMENT_METHODS.ONLINE.code,
        description: "Pay securely online using one of your configured gateways.",
        gateways: {
          connect: onlineGatewayIds.map((id) => ({ id })),
        },
        isActive: true,
        name: CHECKOUT_PAYMENT_METHODS.ONLINE.defaultName,
        type: CHECKOUT_PAYMENT_METHODS.ONLINE.type,
      },
      include: getPaymentMethodInclude(),
    });
  }

  const legacyMethodIds = methods
    .filter(
      (method) =>
        method.id !== codMethod.id &&
        method.id !== onlineMethod.id,
    )
    .map((method) => method.id);

  if (legacyMethodIds.length > 0) {
    await prisma.paymentMethod.updateMany({
      where: { id: { in: legacyMethodIds } },
      data: { isActive: false },
    });
  }

  return [codMethod, onlineMethod];
}

export class PaymentDB {
  // --- Payment Methods ---

  static async listMethods() {
    const managedMethods = await syncCanonicalCheckoutMethods();
    return managedMethods.sort((left, right) => left.name.localeCompare(right.name));
  }

  static async listAllMethods() {
    return await prisma.paymentMethod.findMany({
      include: getPaymentMethodInclude(),
      orderBy: { name: "asc" },
    });
  }

  static async getMethod(id: string) {
    return await prisma.paymentMethod.findUnique({
      where: { id },
      include: getPaymentMethodInclude(),
    });
  }

  static async getCheckoutMethodByCode(code: string) {
    const methods = await syncCanonicalCheckoutMethods();
    return methods.find((method) => method.code === code) || null;
  }

  static async createMethod(data: {
    name: string;
    code: string;
    type: PaymentMethodType;
    description?: string;
    fee?: number;
    feeLabel?: string;
    feeType?: string;
  }) {
    return await prisma.paymentMethod.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        description: data.description,
        fee: data.fee,
        feeLabel: data.feeLabel,
        feeType: data.feeType,
        isActive: true,
      },
    });
  }

  static async updateMethod(
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
    return await prisma.paymentMethod.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        fee: data.fee,
        feeLabel: data.feeLabel,
        feeType: data.feeType,
        // If updating connected gateways
        gateways: data.gatewayIds
          ? {
              set: data.gatewayIds.map((gid) => ({ id: gid })),
            }
          : undefined,
      },
    });
  }

  static async deleteMethod(id: string) {
    return await prisma.paymentMethod.delete({
      where: { id },
    });
  }

  // --- Payment Gateways ---

  static async listGateways() {
    return await prisma.paymentGateway.findMany({
      orderBy: { name: "asc" },
    });
  }

  static async createGateway(data: {
    name: string;
    code: string;
    environment: GatewayEnvironment;
    config: Record<string, string>;
    secretConfig?: string | null;
  }) {
    return await prisma.paymentGateway.create({
      data: {
        name: data.name,
        code: data.code,
        environment: data.environment,
        config: data.config,
        secretConfig: data.secretConfig,
      },
    });
  }

  static async updateGateway(
    id: string,
    data: {
      name?: string;
      environment?: GatewayEnvironment;
      config?: Record<string, string>;
      secretConfig?: string | null;
      isActive?: boolean;
    },
  ) {
    return await prisma.paymentGateway.update({
      where: { id },
      data: {
        name: data.name,
        environment: data.environment,
        config: data.config,
        secretConfig: data.secretConfig,
        isActive: data.isActive,
      },
    });
  }

  static async deleteGateway(id: string) {
    return await prisma.paymentGateway.delete({
      where: { id },
    });
  }
}
