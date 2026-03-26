import prisma from "./prisma";
import { PaymentMethodType, GatewayEnvironment } from "@prisma/client";

export class PaymentDB {
  // --- Payment Methods ---

  static async listMethods() {
    return await prisma.paymentMethod.findMany({
      include: {
        gateways: {
          select: {
            code: true,
            environment: true,
            id: true,
            isActive: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async getMethod(id: string) {
    return await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        gateways: {
          select: {
            code: true,
            environment: true,
            id: true,
            isActive: true,
            name: true,
          },
        },
      },
    });
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
