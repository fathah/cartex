import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { resolveGatewayConfig } from "@/services/gateway-config";
import { applyPaymentOutcome, hashWebhookPayload } from "@/services/payment-webhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authorization = req.headers.get("authorization") ?? "";

    const gateway = await prisma.paymentGateway.findUnique({
      where: { code: "network_international" },
    });
    if (!gateway) {
      return NextResponse.json({ error: "Gateway not configured" }, { status: 400 });
    }

    const { mergedConfig } = await resolveGatewayConfig(gateway);
    if (!mergedConfig.apiKey) {
      return NextResponse.json({ error: "Gateway not configured" }, { status: 400 });
    }

    if (!authorization || !authorization.includes(mergedConfig.apiKey)) {
      return NextResponse.json({ error: "Invalid authorization" }, { status: 401 });
    }

    const reference = body?.reference;
    const state = body?.state;
    if (!reference || !state) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const intent = await prisma.paymentIntent.findFirst({
      where: { gatewayRef: reference },
      select: { id: true },
    });
    if (!intent) {
      return NextResponse.json({ error: "Intent not found" }, { status: 404 });
    }

    if (state === "CAPTURED" || state === "PURCHASED") {
      await applyPaymentOutcome({
        eventKey: body?.eventId || `${reference}:${state}`,
        gatewayRef: reference,
        intentId: intent.id,
        payload: body,
        provider: "network_international",
        status: "SUCCESS",
      });
    } else if (state === "FAILED" || state === "REVERSED") {
      await applyPaymentOutcome({
        eventKey: body?.eventId || `${reference}:${state}:${hashWebhookPayload(body)}`,
        gatewayRef: reference,
        intentId: intent.id,
        payload: body,
        provider: "network_international",
        status: "FAILED",
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[network-webhook]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
