import { beforeEach, describe, expect, it, vi } from "vitest";

describe("services/gateway-config", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.APP_CONFIG_ENCRYPTION_KEY = "gateway-secret";
  });

  it("splits public and secret gateway config", async () => {
    vi.doMock("@/db/prisma", () => ({
      default: {
        paymentGateway: {
          update: vi.fn(),
        },
      },
    }));

    const { splitGatewayConfig } = await import("@/services/gateway-config");

    expect(
      splitGatewayConfig("stripe", {
        publishableKey: "pk_test_123",
        secretKey: "sk_test_123",
        webhookSecret: "whsec_123",
      }),
    ).toEqual({
      publicConfig: {
        publishableKey: "pk_test_123",
      },
      secretConfig: {
        secretKey: "sk_test_123",
        webhookSecret: "whsec_123",
      },
    });
  });

  it("encrypts and decrypts gateway secrets", async () => {
    vi.doMock("@/db/prisma", () => ({
      default: {
        paymentGateway: {
          update: vi.fn(),
        },
      },
    }));

    const { decryptGatewaySecrets, encryptGatewaySecrets } = await import(
      "@/services/gateway-config"
    );

    const encrypted = encryptGatewaySecrets({
      secretKey: "sk_live",
      webhookSecret: "whsec_live",
    });

    expect(decryptGatewaySecrets(encrypted)).toEqual({
      secretKey: "sk_live",
      webhookSecret: "whsec_live",
    });
  });

  it("preserves existing secrets when a partial update omits them", async () => {
    vi.doMock("@/db/prisma", () => ({
      default: {
        paymentGateway: {
          update: vi.fn(),
        },
      },
    }));

    const { encryptGatewaySecrets, mergeGatewayConfigForSave } = await import(
      "@/services/gateway-config"
    );

    const result = await mergeGatewayConfigForSave({
      code: "stripe",
      config: {
        publishableKey: "pk_next",
        secretKey: "",
      },
      existingGateway: {
        id: "gateway_1",
        code: "stripe",
        config: { publishableKey: "pk_prev" },
        secretConfig: encryptGatewaySecrets({
          secretKey: "sk_prev",
          webhookSecret: "whsec_prev",
        }),
      },
    });

    expect(result.config).toEqual({ publishableKey: "pk_next" });
    expect(result.secrets).toEqual({
      secretKey: "sk_prev",
      webhookSecret: "whsec_prev",
    });
  });
});
