"use server";

import { z } from "zod";
import Stripe from "stripe";
import { PUBLIC_ENV } from "@/constants/env_public";
import prisma from "@/db/prisma";
import { getCurrentUser } from "./user";
import { resolveGatewayConfig } from "@/services/gateway-config";
import { requireAdminRole } from "@/services/zauth";
import { UserRole } from "@prisma/client";

const initiateGatewayPaymentSchema = z.object({
  gatewayCode: z.string().trim().min(1),
  orderId: z.string().trim().min(1),
});

function getBaseUrl() {
  return PUBLIC_ENV.BASE_URL || "http://localhost:3000";
}

export async function initiateGatewayPayment(
  orderId: string,
  gatewayCode: string,
): Promise<
  | { type: "redirect"; url: string }
  | {
      type: "razorpay";
      amount: number;
      currency: string;
      keyId: string;
      name: string;
      orderId: string;
    }
  | { type: "none" }
  | { error: string }
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Authentication required" };
    }

    const input = initiateGatewayPaymentSchema.parse({ gatewayCode, orderId });
    const order = await prisma.order.findFirst({
      where: {
        customerId: user.id,
        id: input.orderId,
      },
      include: {
        paymentIntents: {
          include: {
            gateway: true,
            paymentMethod: {
              include: {
                gateways: {
                  where: { isActive: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!order) {
      return { error: "Order not found" };
    }

    const intent = order.paymentIntents[0];
    if (!intent) {
      return { error: "Payment intent not found" };
    }

    if (order.paymentStatus === "PAID" || intent.status === "SUCCESS") {
      return { error: "Order is already paid" };
    }

    const allowedGateway = intent.paymentMethod.gateways.find(
      (gateway) => gateway.code === input.gatewayCode,
    );
    if (!allowedGateway) {
      return { error: "Gateway is not allowed for this payment method" };
    }

    const gateway = await prisma.paymentGateway.findFirst({
      where: {
        code: input.gatewayCode,
        id: allowedGateway.id,
        isActive: true,
      },
    });
    if (!gateway) {
      return { error: "Payment gateway not available" };
    }

    const { mergedConfig } = await resolveGatewayConfig(gateway);
    const amountInCents = Math.round(Number(intent.amount) * 100);
    const currency = intent.currency.toLowerCase();
    const appUrl = getBaseUrl();

    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: {
        gatewayId: gateway.id,
        status: "PROCESSING",
      },
    });

    if (gateway.code === "stripe") {
      const secretKey = mergedConfig.secretKey;
      if (!secretKey) {
        return { error: "Stripe is not configured" };
      }

      const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });
      const session = await stripe.checkout.sessions.create({
        cancel_url: `${appUrl}/checkout?cancelled=true`,
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: `Order #${order.id.slice(-8).toUpperCase()}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order.id, paymentIntentId: intent.id },
        mode: "payment",
        payment_intent_data: {
          metadata: { orderId: order.id, paymentIntentId: intent.id },
        },
        success_url: `${appUrl}/account/orders/${order.id}?success=true`,
      });

      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { gatewayRef: session.id },
      });

      return { type: "redirect", url: session.url! };
    }

    if (gateway.code === "razorpay") {
      const keyId = mergedConfig.keyId;
      const keySecret = mergedConfig.keySecret;
      if (!keyId || !keySecret) {
        return { error: "Razorpay is not configured" };
      }

      const Razorpay = (await import("razorpay")).default;
      const client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const razorpayOrder = await client.orders.create({
        amount: amountInCents,
        currency: currency.toUpperCase(),
        notes: { orderId: order.id, paymentIntentId: intent.id },
        receipt: intent.id,
      });

      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { gatewayRef: razorpayOrder.id },
      });

      return {
        type: "razorpay",
        amount: amountInCents,
        currency: currency.toUpperCase(),
        keyId,
        name: "Cartex",
        orderId: razorpayOrder.id as string,
      };
    }

    if (gateway.code === "network_international") {
      const apiKey = mergedConfig.apiKey;
      const outletRef = mergedConfig.outletRef;
      if (!apiKey || !outletRef) {
        return { error: "Network International is not configured" };
      }

      const baseUrl =
        gateway.environment === "TEST"
          ? "https://api-gateway.sandbox.ngenius-payments.com"
          : "https://api-gateway.ngenius-payments.com";

      const tokenRes = await fetch(`${baseUrl}/identity/auth/access-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.ni-identity.v1+json",
          Authorization: `Basic ${Buffer.from(`:${apiKey}`).toString("base64")}`,
        },
        body: JSON.stringify({ realmName: "ni" }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData?.access_token) {
        return { error: "Network International token request failed" };
      }

      const orderRes = await fetch(
        `${baseUrl}/transactions/outlets/${outletRef}/orders`,
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.ni-payment.v2+json",
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/vnd.ni-payment.v2+json",
          },
          body: JSON.stringify({
            action: "SALE",
            amount: {
              currencyCode: currency.toUpperCase(),
              value: amountInCents,
            },
            merchantAttributes: {
              cancelUrl: `${appUrl}/checkout?cancelled=true`,
              redirectUrl: `${appUrl}/account/orders/${order.id}?success=true`,
            },
            merchantDefinedData: {
              orderId: order.id,
              paymentIntentId: intent.id,
            },
          }),
        },
      );
      const networkOrder = await orderRes.json();
      const paymentUrl = networkOrder?._links?.payment?.href;

      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: {
          gatewayRef: networkOrder.reference,
          response: networkOrder,
        },
      });

      if (!orderRes.ok || !paymentUrl) {
        return { error: "Network International session failed" };
      }

      return { type: "redirect", url: paymentUrl };
    }

    if (gateway.code === "phonepe") {
      const merchantId = mergedConfig.merchantId;
      const saltKey = mergedConfig.saltKey;
      const saltIndex = Number(mergedConfig.saltIndex) || 1;
      const callbackUrl =
        mergedConfig.callbackUrl || `${appUrl}/api/webhooks/phonepe`;
      if (!merchantId || !saltKey) {
        return { error: "PhonePe is not configured" };
      }

      const baseUrl =
        gateway.environment === "TEST"
          ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
          : "https://api.phonepe.com/apis/hermes";
      const crypto = await import("crypto");

      const payload = {
        amount: amountInCents,
        callbackUrl,
        currency: "INR",
        merchantId,
        merchantTransactionId: intent.id,
        paymentInstrument: { type: "PAY_PAGE" },
        redirectMode: "REDIRECT",
        redirectUrl: `${appUrl}/account/orders/${order.id}?success=true`,
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
        "base64",
      );
      const hash = crypto
        .createHash("sha256")
        .update(`${base64Payload}/pg/v1/pay${saltKey}`)
        .digest("hex");
      const xVerify = `${hash}###${saltIndex}`;

      const phonePeRes = await fetch(`${baseUrl}/pg/v1/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
        },
        body: JSON.stringify({ request: base64Payload }),
      });
      const phonePeData = await phonePeRes.json();
      const payUrl = phonePeData?.data?.instrumentResponse?.redirectInfo?.url;

      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: {
          gatewayRef: intent.id,
          response: phonePeData,
        },
      });

      if (!phonePeRes.ok || !payUrl) {
        return { error: "PhonePe session creation failed" };
      }

      return { type: "redirect", url: payUrl };
    }

    return { type: "none" };
  } catch (error: any) {
    console.error("[initiateGatewayPayment]", error);
    return { error: error?.message || "Payment initiation failed" };
  }
}

export async function markPaymentSuccess(orderId: string, gatewayRef: string) {
  await requireAdminRole(UserRole.SUPER_ADMIN);

  await prisma.paymentIntent.updateMany({
    where: { orderId },
    data: { gatewayRef, status: "SUCCESS" },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID" },
  });
}
