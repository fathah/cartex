import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { resolveGatewayConfig } from "@/services/gateway-config";
import prisma from "@/db/prisma";
import { applyPaymentOutcome } from "@/services/payment-webhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const xVerify = req.headers.get("x-verify") ?? "";
    const base64Payload = body.response as string;
    if (!base64Payload) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const gateway = await prisma.paymentGateway.findUnique({
      where: { code: "phonepe" },
    });
    if (!gateway) {
      return NextResponse.json({ error: "Gateway not configured" }, { status: 400 });
    }

    const { mergedConfig } = await resolveGatewayConfig(gateway);
    const saltKey = mergedConfig.saltKey;
    const saltIndex = Number(mergedConfig.saltIndex) || 1;
    if (!saltKey) {
      return NextResponse.json({ error: "Gateway not configured" }, { status: 400 });
    }

    const [receivedHash, receivedIndex] = xVerify.split("###");
    const expectedHash = crypto
      .createHash("sha256")
      .update(`${base64Payload}/pg/v1/status${saltKey}`)
      .digest("hex");

    if (receivedHash !== expectedHash || Number(receivedIndex) !== saltIndex) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const decoded = JSON.parse(
      Buffer.from(base64Payload, "base64").toString("utf-8"),
    );
    const paymentIntentId = decoded?.data?.merchantTransactionId;
    const state = decoded?.data?.state;

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    }

    if (state === "COMPLETED") {
      await applyPaymentOutcome({
        eventKey: `${paymentIntentId}:COMPLETED`,
        gatewayRef: decoded?.data?.transactionId || paymentIntentId,
        intentId: paymentIntentId,
        payload: decoded,
        provider: "phonepe",
        status: "SUCCESS",
      });
    } else if (state === "FAILED") {
      await applyPaymentOutcome({
        eventKey: `${paymentIntentId}:FAILED`,
        gatewayRef: decoded?.data?.transactionId || paymentIntentId,
        intentId: paymentIntentId,
        payload: decoded,
        provider: "phonepe",
        status: "FAILED",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[phonepe-webhook]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
