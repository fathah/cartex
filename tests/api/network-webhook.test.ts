import { beforeEach, describe, expect, it, vi } from "vitest";

describe("app/api/webhooks/network", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("rejects authorization headers that only contain the API key as a substring", async () => {
    vi.doMock("@/db/prisma", () => ({
      default: {
        paymentGateway: {
          findUnique: vi.fn().mockResolvedValue({
            id: "gateway_1",
            code: "network_international",
            config: {},
            secretConfig: "{}",
          }),
        },
        paymentIntent: {
          findFirst: vi.fn(),
        },
      },
    }));
    vi.doMock("@/services/gateway-config", () => ({
      resolveGatewayConfig: vi.fn().mockResolvedValue({
        mergedConfig: {
          apiKey: "secret-token",
        },
      }),
    }));
    vi.doMock("@/services/payment-webhooks", () => ({
      applyPaymentOutcome: vi.fn(),
      hashWebhookPayload: vi.fn().mockReturnValue("hash"),
    }));

    const { POST } = await import("@/app/api/webhooks/network/route");
    const request = {
      headers: new Headers({
        authorization: "Bearer prefix-secret-token-suffix",
      }),
      json: vi.fn().mockResolvedValue({
        reference: "order-ref",
        state: "CAPTURED",
      }),
    };

    const response = await POST(request as Parameters<typeof POST>[0]);

    expect(response.status).toBe(401);
  });

  it("accepts exact bearer tokens and applies successful outcomes", async () => {
    const applyPaymentOutcome = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@/db/prisma", () => ({
      default: {
        paymentGateway: {
          findUnique: vi.fn().mockResolvedValue({
            id: "gateway_1",
            code: "network_international",
            config: {},
            secretConfig: "{}",
          }),
        },
        paymentIntent: {
          findFirst: vi.fn().mockResolvedValue({ id: "pi_1" }),
        },
      },
    }));
    vi.doMock("@/services/gateway-config", () => ({
      resolveGatewayConfig: vi.fn().mockResolvedValue({
        mergedConfig: {
          apiKey: "secret-token",
        },
      }),
    }));
    vi.doMock("@/services/payment-webhooks", () => ({
      applyPaymentOutcome,
      hashWebhookPayload: vi.fn().mockReturnValue("hash"),
    }));

    const { POST } = await import("@/app/api/webhooks/network/route");
    const request = {
      headers: new Headers({
        authorization: "Bearer secret-token",
      }),
      json: vi.fn().mockResolvedValue({
        eventId: "evt_1",
        reference: "order-ref",
        state: "CAPTURED",
      }),
    };

    const response = await POST(request as Parameters<typeof POST>[0]);

    expect(response.status).toBe(200);
    expect(applyPaymentOutcome).toHaveBeenCalledWith({
      eventKey: "evt_1",
      gatewayRef: "order-ref",
      intentId: "pi_1",
      payload: {
        eventId: "evt_1",
        reference: "order-ref",
        state: "CAPTURED",
      },
      provider: "network_international",
      status: "SUCCESS",
    });
  });
});
