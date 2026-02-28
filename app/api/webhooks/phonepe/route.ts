import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/db/prisma";

/**
 * PhonePe Payment Callback
 * PhonePe POSTs a base64-encoded response with an X-VERIFY header.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const xVerify = req.headers.get("x-verify") ?? "";

    // body.response is base64-encoded JSON payload
    const base64Payload = body.response as string;
    if (!base64Payload) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    // Find gateway config
    const gateway = await prisma.paymentGateway.findUnique({
      where: { code: "phonepe" },
    });
    if (!gateway) {
      return NextResponse.json(
        { error: "Gateway not configured" },
        { status: 400 },
      );
    }

    const config = gateway.config as Record<string, any>;
    const saltKey = config.saltKey as string;
    const saltIndex = Number(config.saltIndex) || 1;

    // Verify: SHA256(base64Payload + "/pg/v1/status" + saltKey) + "###" + saltIndex
    const [receivedHash, receivedIndex] = xVerify.split("###");
    const expectedHash = crypto
      .createHash("sha256")
      .update(`${base64Payload}/pg/v1/status${saltKey}`)
      .digest("hex");

    if (receivedHash !== expectedHash || Number(receivedIndex) !== saltIndex) {
      console.error("[phonepe-webhook] Signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Decode response
    const decoded = JSON.parse(
      Buffer.from(base64Payload, "base64").toString("utf-8"),
    );

    const txnId: string = decoded?.data?.merchantTransactionId;
    const state: string = decoded?.data?.state; // COMPLETED / FAILED / PENDING

    if (!txnId) {
      return NextResponse.json({ error: "Missing txnId" }, { status: 400 });
    }

    // txnId == PaymentIntent.id (set as merchantTransactionId during initiation)
    const intent = await prisma.paymentIntent.findUnique({
      where: { id: txnId },
    });
    if (!intent) {
      return NextResponse.json({ error: "Intent not found" }, { status: 404 });
    }

    if (state === "COMPLETED") {
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: "SUCCESS", response: decoded },
      });
      await prisma.order.update({
        where: { id: intent.orderId },
        data: { paymentStatus: "PAID" },
      });
      console.log("[phonepe-webhook] Order paid:", intent.orderId);
    } else if (state === "FAILED") {
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: "FAILED", response: decoded },
      });
      await prisma.order.update({
        where: { id: intent.orderId },
        data: { paymentStatus: "FAILED" },
      });
      console.log("[phonepe-webhook] Payment failed:", intent.orderId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[phonepe-webhook]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
