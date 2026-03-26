import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "@/db/prisma";
import { PAYMENT_STATUS } from "@/constants/commerce";

type PaymentOutcome = "SUCCESS" | "FAILED";

export function hashWebhookPayload(payload: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(payload ?? {}))
    .digest("hex");
}

export async function recordWebhookEvent(input: {
  eventKey: string;
  orderId?: string | null;
  paymentIntentId?: string | null;
  payload?: Prisma.InputJsonValue;
  provider: string;
}) {
  try {
    await prisma.webhookEventLog.create({
      data: {
        eventKey: input.eventKey,
        orderId: input.orderId || undefined,
        payload: input.payload,
        paymentIntentId: input.paymentIntentId || undefined,
        provider: input.provider,
      },
    });
    return true;
  } catch (error: any) {
    if (error?.code === "P2002") {
      return false;
    }

    throw error;
  }
}

export async function applyPaymentOutcome(input: {
  eventKey: string;
  gatewayRef?: string | null;
  intentId: string;
  payload?: Prisma.InputJsonValue;
  provider: string;
  status: PaymentOutcome;
}) {
  return prisma.$transaction(async (tx) => {
    const intent = await tx.paymentIntent.findUnique({
      where: { id: input.intentId },
      include: { order: true },
    });
    if (!intent) {
      return { duplicate: false, intent: null };
    }

    try {
      await tx.webhookEventLog.create({
        data: {
          eventKey: input.eventKey,
          orderId: intent.orderId,
          payload: input.payload,
          paymentIntentId: intent.id,
          provider: input.provider,
        },
      });
    } catch (error: any) {
      if (error?.code === "P2002") {
        return { duplicate: true, intent };
      }

      throw error;
    }

    const isSuccess = input.status === "SUCCESS";
    const nextOrderPaymentStatus = isSuccess
      ? PAYMENT_STATUS.PAID
      : PAYMENT_STATUS.FAILED;

    await tx.paymentIntent.update({
      where: { id: intent.id },
      data: {
        gatewayRef: input.gatewayRef ?? intent.gatewayRef,
        response: input.payload,
        status: input.status,
      },
    });

    if (intent.order.paymentStatus !== nextOrderPaymentStatus) {
      await tx.order.update({
        where: { id: intent.orderId },
        data: { paymentStatus: nextOrderPaymentStatus },
      });
    }

    return { duplicate: false, intent };
  });
}
