"use server";

import { ENV } from "@/constants/envs";
import prisma from "@/db/prisma";
import Stripe from "stripe";

/**
 * After an order is created with a PENDING PaymentIntent,
 * this action initiates the payment with the selected gateway.
 *
 * Returns one of:
 *   { type: "redirect", url } → redirect the browser to the gateway's hosted page
 *   { type: "razorpay", orderId, amount, currency, keyId, name, description } → open Razorpay modal on client
 *   { type: "none" } → COD/wallet, no gateway needed; order is already placed
 */
export async function initiateGatewayPayment(
  orderId: string,
  gatewayCode: string,
): Promise<
  | { type: "redirect"; url: string }
  | {
      type: "razorpay";
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      name: string;
    }
  | { type: "none" }
  | { error: string }
> {
  try {
    // 1. Load the gateway config from DB
    const gateway = await prisma.paymentGateway.findUnique({
      where: { code: gatewayCode },
    });
    if (!gateway || !gateway.isActive) {
      return { error: "Payment gateway not available" };
    }

    // 2. Load the order + payment intent
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        paymentIntents: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!order) return { error: "Order not found" };

    const intent = order.paymentIntents[0];
    if (!intent) return { error: "Payment intent not found" };

    const amountInCents = Math.round(Number(intent.amount) * 100);
    const currency = intent.currency.toLowerCase();
    const config = gateway.config as Record<string, any>;

    // 3. Update intent to link to gateway
    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: { gatewayId: gateway.id, status: "PROCESSING" },
    });

    // ── STRIPE ─────────────────────────────────────────────────────────────
    if (gatewayCode === "stripe") {
      const secretKey = config.secretKey as string;
      const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

      const baseUrl = ENV.BASE_URL || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: `Order #${orderId.slice(-8).toUpperCase()}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          metadata: { orderId, paymentIntentId: intent.id },
        },
        success_url: `${baseUrl}/account/orders/${orderId}?success=true`,
        cancel_url: `${baseUrl}/checkout?cancelled=true`,
        metadata: { orderId, paymentIntentId: intent.id },
      });

      // Store the session id as gatewayRef
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { gatewayRef: session.id },
      });

      return { type: "redirect", url: session.url! };
    }

    // ── RAZORPAY ────────────────────────────────────────────────────────────
    if (gatewayCode === "razorpay") {
      const Razorpay = (await import("razorpay")).default;
      const rzp = new Razorpay({
        key_id: config.keyId as string,
        key_secret: config.keySecret as string,
      });

      const rzpOrder = await rzp.orders.create({
        amount: amountInCents, // Razorpay expects paise (smallest unit)
        currency: currency.toUpperCase(),
        receipt: intent.id,
        notes: { orderId, paymentIntentId: intent.id },
      });

      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { gatewayRef: rzpOrder.id },
      });

      return {
        type: "razorpay",
        orderId: rzpOrder.id as string,
        amount: amountInCents,
        currency: currency.toUpperCase(),
        keyId: config.keyId as string,
        name: "Cartex",
      };
    }

    // ── NETWORK INTERNATIONAL ───────────────────────────────────────────────
    if (gatewayCode === "network_international") {
      const apiKey = config.apiKey as string;
      const outletRef = config.outletRef as string;
      const isSandbox = gateway.environment === "TEST";
      const baseUrl = isSandbox
        ? "https://api-gateway.sandbox.ngenius-payments.com"
        : "https://api-gateway.ngenius-payments.com";

      const appUrl = ENV.BASE_URL || "http://localhost:3000";

      // Create an order/payment session on Network International
      const tokenRes = await fetch(`${baseUrl}/identity/auth/access-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.ni-identity.v1+json",
          Authorization: `Basic ${Buffer.from(`:${apiKey}`).toString("base64")}`,
        },
        body: JSON.stringify({ realmName: "ni" }),
      });
      const { access_token } = await tokenRes.json();

      const orderRes = await fetch(
        `${baseUrl}/transactions/outlets/${outletRef}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/vnd.ni-payment.v2+json",
            Accept: "application/vnd.ni-payment.v2+json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            action: "SALE",
            amount: {
              currencyCode: currency.toUpperCase(),
              value: amountInCents,
            },
            merchantDefinedData: { orderId, paymentIntentId: intent.id },
            merchantAttributes: {
              redirectUrl: `${appUrl}/account/orders/${orderId}?success=true`,
              cancelUrl: `${appUrl}/checkout?cancelled=true`,
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

      if (!paymentUrl) return { error: "Network International session failed" };
      return { type: "redirect", url: paymentUrl };
    }

    // ── PHONEPE ─────────────────────────────────────────────────────────────
    if (gatewayCode === "phonepe") {
      const merchantId = config.merchantId as string;
      const saltKey = config.saltKey as string;
      const saltIndex = Number(config.saltIndex) || 1;
      const callbackUrl = config.callbackUrl as string;
      const isSandbox = gateway.environment === "TEST";
      const baseUrl = isSandbox
        ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
        : "https://api.phonepe.com/apis/hermes";

      const appUrl = ENV.BASE_URL || "http://localhost:3000";
      const crypto = await import("crypto");

      const payload = {
        merchantId,
        merchantTransactionId: intent.id,
        amount: amountInCents,
        currency: "INR",
        redirectUrl: `${appUrl}/account/orders/${orderId}?success=true`,
        redirectMode: "REDIRECT",
        callbackUrl: callbackUrl || `${appUrl}/api/webhooks/phonepe`,
        paymentInstrument: { type: "PAY_PAGE" },
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
        "base64",
      );
      const hash = crypto
        .createHash("sha256")
        .update(`${base64Payload}/pg/v1/pay${saltKey}`)
        .digest("hex");
      const xVerify = `${hash}###${saltIndex}`;

      const ppRes = await fetch(`${baseUrl}/pg/v1/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
        },
        body: JSON.stringify({ request: base64Payload }),
      });
      const ppData = await ppRes.json();
      const payUrl = ppData?.data?.instrumentResponse?.redirectInfo?.url;

      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: {
          gatewayRef: intent.id,
          response: ppData,
        },
      });

      if (!payUrl) return { error: "PhonePe session creation failed" };
      return { type: "redirect", url: payUrl };
    }

    // Fallback — no gateway match
    return { type: "none" };
  } catch (err: any) {
    console.error("[initiateGatewayPayment]", err);
    return { error: err?.message || "Payment initiation failed" };
  }
}

/**
 * Mark a payment intent as successful (called from webhook or success callback).
 * Updates order status to PAID.
 */
export async function markPaymentSuccess(orderId: string, gatewayRef: string) {
  await prisma.paymentIntent.updateMany({
    where: { orderId },
    data: { status: "SUCCESS", gatewayRef },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID" },
  });
}
