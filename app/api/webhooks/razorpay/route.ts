import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/db/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Razorpay sends: razorpay_payment_id, razorpay_order_id, razorpay_signature
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Find the gateway config
  const gateway = await prisma.paymentGateway.findUnique({
    where: { code: "razorpay" },
  });
  if (!gateway) {
    return NextResponse.json(
      { error: "Gateway not configured" },
      { status: 400 },
    );
  }

  const config = gateway.config as Record<string, any>;
  const keySecret = config.keySecret as string;

  // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, keySecret)
  const generated = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated !== razorpay_signature) {
    console.error("[razorpay-webhook] Signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Find the payment intent by gatewayRef (Razorpay order id)
  const intent = await prisma.paymentIntent.findFirst({
    where: { gatewayRef: razorpay_order_id },
  });
  if (!intent) {
    return NextResponse.json({ error: "Intent not found" }, { status: 404 });
  }

  // Mark SUCCESS
  await prisma.paymentIntent.update({
    where: { id: intent.id },
    data: {
      status: "SUCCESS",
      gatewayRef: razorpay_payment_id,
      response: body,
    },
  });

  await prisma.order.update({
    where: { id: intent.orderId },
    data: { paymentStatus: "PAID" },
  });

  console.log("[razorpay-webhook] Order paid:", intent.orderId);
  return NextResponse.json({ received: true });
}
