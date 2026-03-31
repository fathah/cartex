import { beforeEach, describe, expect, it, vi } from "vitest";

describe("services/payment-webhooks", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns false for duplicate webhook records", async () => {
    const create = vi.fn().mockRejectedValue({ code: "P2002" });

    vi.doMock("@/db/prisma", () => ({
      default: {
        webhookEventLog: {
          create,
        },
      },
    }));

    const { recordWebhookEvent } = await import("@/services/payment-webhooks");

    await expect(
      recordWebhookEvent({
        eventKey: "evt_1",
        provider: "stripe",
      }),
    ).resolves.toBe(false);
  });

  it("applies a successful payment outcome and updates the order", async () => {
    const tx = {
      paymentIntent: {
        findUnique: vi.fn().mockResolvedValue({
          id: "pi_1",
          gatewayRef: "ref_1",
          orderId: "order_1",
          order: {
            paymentStatus: "PENDING",
          },
        }),
        update: vi.fn().mockResolvedValue(undefined),
      },
      webhookEventLog: {
        create: vi.fn().mockResolvedValue(undefined),
      },
      order: {
        update: vi.fn().mockResolvedValue(undefined),
      },
    };

    vi.doMock("@/db/prisma", () => ({
      default: {
        $transaction: (callback: (value: typeof tx) => Promise<unknown>) =>
          callback(tx),
      },
    }));

    const { applyPaymentOutcome } = await import("@/services/payment-webhooks");

    const result = await applyPaymentOutcome({
      eventKey: "evt_1",
      gatewayRef: "ch_1",
      intentId: "pi_1",
      payload: { id: "event" },
      provider: "stripe",
      status: "SUCCESS",
    });

    expect(result).toEqual({
      duplicate: false,
      intent: expect.objectContaining({ id: "pi_1" }),
    });
    expect(tx.paymentIntent.update).toHaveBeenCalledWith({
      where: { id: "pi_1" },
      data: {
        gatewayRef: "ch_1",
        response: { id: "event" },
        status: "SUCCESS",
      },
    });
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { paymentStatus: "PAID" },
    });
  });
});
