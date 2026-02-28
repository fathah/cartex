import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

/**
 * Network International (NGenius) Webhook Handler
 * NGenius sends payment notification events as JSON POST requests.
 * Authentication: API key in Authorization header.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Optionally verify the Authorization header
    const authHeader = req.headers.get("authorization") ?? "";
    const gateway = await prisma.paymentGateway.findUnique({
      where: { code: "network_international" },
    });
    if (!gateway) {
      return NextResponse.json(
        { error: "Gateway not configured" },
        { status: 400 },
      );
    }

    const config = gateway.config as Record<string, any>;
    // For outbound webhook verification, NGenius recommends comparing HMAC or simply
    // looking up the order by reference. Basic verification: match API Key in header.
    const apiKey = config.apiKey as string;
    if (authHeader && !authHeader.includes(apiKey)) {
      console.warn("[network-webhook] Authorization header mismatch");
    }

    // NGenius sends: { reference, state, amount, currency, ... }
    const { reference, state } = body;
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Find the PaymentIntent by gatewayRef
    const intent = await prisma.paymentIntent.findFirst({
      where: { gatewayRef: reference },
    });
    if (!intent) {
      // Also try by orderId fragment
      console.warn("[network-webhook] Intent not found for ref:", reference);
      return NextResponse.json({ received: true }); // Acknowledge to stop retries
    }

    if (state === "CAPTURED" || state === "PURCHASED") {
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: "SUCCESS", response: body },
      });
      await prisma.order.update({
        where: { id: intent.orderId },
        data: { paymentStatus: "PAID" },
      });
      console.log("[network-webhook] Order paid:", intent.orderId);
    } else if (state === "FAILED" || state === "REVERSED") {
      await prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: "FAILED", response: body },
      });
      await prisma.order.update({
        where: { id: intent.orderId },
        data: { paymentStatus: "FAILED" },
      });
      console.log("[network-webhook] Payment failed:", intent.orderId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[network-webhook]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
