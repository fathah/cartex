import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/db/prisma";
import { resolveGatewayConfig } from "@/services/gateway-config";
import { applyPaymentOutcome, hashWebhookPayload } from "@/services/payment-webhooks";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const gateway = await prisma.paymentGateway.findUnique({
    where: { code: "stripe" },
  });
  if (!gateway) {
    return NextResponse.json({ error: "Gateway not configured" }, { status: 400 });
  }

  const { mergedConfig } = await resolveGatewayConfig(gateway);
  if (!mergedConfig.secretKey || !mergedConfig.webhookSecret || !signature) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 400 });
  }

  const stripe = new Stripe(mergedConfig.secretKey, {
    apiVersion: "2026-02-25.clover",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      mergedConfig.webhookSecret,
    );
  } catch (error: any) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = session.metadata?.paymentIntentId;
      if (!paymentIntentId) {
        return NextResponse.json({ received: true });
      }

      await applyPaymentOutcome({
        eventKey: event.id,
        gatewayRef: String(session.payment_intent || session.id),
        intentId: paymentIntentId,
        payload: session as any,
        provider: "stripe",
        status: "SUCCESS",
      });
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "payment_intent.payment_failed"
    ) {
      const payload = event.data.object as any;
      const paymentIntentId = payload?.metadata?.paymentIntentId;
      if (!paymentIntentId) {
        return NextResponse.json({ received: true });
      }

      await applyPaymentOutcome({
        eventKey: event.id || hashWebhookPayload(payload),
        gatewayRef: String(payload?.id || ""),
        intentId: paymentIntentId,
        payload,
        provider: "stripe",
        status: "FAILED",
      });
    }
  } catch (error) {
    console.error("[stripe-webhook]", error);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
