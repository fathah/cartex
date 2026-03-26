import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/db/prisma";
import { resolveGatewayConfig } from "@/services/gateway-config";
import { applyPaymentOutcome } from "@/services/payment-webhooks";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const gateway = await prisma.paymentGateway.findUnique({
    where: { code: "razorpay" },
  });
  if (!gateway) {
    return NextResponse.json({ error: "Gateway not configured" }, { status: 400 });
  }

  const { mergedConfig } = await resolveGatewayConfig(gateway);
  if (!mergedConfig.keySecret) {
    return NextResponse.json({ error: "Gateway not configured" }, { status: 400 });
  }

  const generatedSignature = crypto
    .createHmac("sha256", mergedConfig.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const intent = await prisma.paymentIntent.findFirst({
    where: { gatewayRef: razorpay_order_id },
    select: { id: true },
  });
  if (!intent) {
    return NextResponse.json({ error: "Intent not found" }, { status: 404 });
  }

  await applyPaymentOutcome({
    eventKey: `${razorpay_order_id}:${razorpay_payment_id}`,
    gatewayRef: razorpay_payment_id,
    intentId: intent.id,
    payload: body,
    provider: "razorpay",
    status: "SUCCESS",
  });

  return NextResponse.json({ received: true });
}
