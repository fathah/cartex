import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/db/prisma";

export async function POST(req: NextRequest) {
  // Read the raw body for signature verification
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // Find the stripe gateway config to get webhook secret
  const gateway = await prisma.paymentGateway.findUnique({
    where: { code: "stripe" },
  });
  if (!gateway) {
    return NextResponse.json(
      { error: "Gateway not configured" },
      { status: 400 },
    );
  }

  const config = gateway.config as Record<string, any>;
  const webhookSecret = config.webhookSecret as string;
  const secretKey = config.secretKey as string;

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error(
      "[stripe-webhook] Signature verification failed:",
      err.message,
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[stripe-webhook] Event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const paymentIntentId = session.metadata?.paymentIntentId;
        if (!orderId) break;

        // Mark intent as SUCCESS
        await prisma.paymentIntent.updateMany({
          where: {
            orderId,
            ...(paymentIntentId ? { id: paymentIntentId } : {}),
          },
          data: {
            status: "SUCCESS",
            gatewayRef: session.payment_intent as string,
            response: session as any,
          },
        });

        // Mark order payment as PAID
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID" },
        });

        console.log("[stripe-webhook] Order paid:", orderId);
        break;
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const obj = event.data.object as any;
        const orderId = obj.metadata?.orderId;
        if (!orderId) break;

        await prisma.paymentIntent.updateMany({
          where: { orderId },
          data: { status: "FAILED" },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        });

        console.log("[stripe-webhook] Payment failed for order:", orderId);
        break;
      }

      default:
        // Unhandled event types — ignore
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
