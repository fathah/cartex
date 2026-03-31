import { beforeEach, describe, expect, it, vi } from "vitest";

describe("services/rate-limit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("reads the first forwarded IP address", async () => {
    vi.doMock("next/headers", () => ({
      headers: vi.fn().mockResolvedValue(
        new Headers({
          "x-forwarded-for": "203.0.113.10, 10.0.0.1",
        }),
      ),
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {
        rateLimitBucket: {},
      },
    }));

    const { getRequestIp } = await import("@/services/rate-limit");

    await expect(getRequestIp()).resolves.toBe("203.0.113.10");
  });

  it("prefers provider-set direct IP headers over forwarded-for", async () => {
    vi.doMock("next/headers", () => ({
      headers: vi.fn().mockResolvedValue(
        new Headers({
          "cf-connecting-ip": "198.51.100.8",
          "x-forwarded-for": "203.0.113.10, 10.0.0.1",
        }),
      ),
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {
        rateLimitBucket: {},
      },
    }));

    const { getRequestIp } = await import("@/services/rate-limit");

    await expect(getRequestIp()).resolves.toBe("198.51.100.8");
  });

  it("rejects malformed forwarded IP values", async () => {
    vi.doMock("next/headers", () => ({
      headers: vi.fn().mockResolvedValue(
        new Headers({
          "x-forwarded-for": "totally-not-an-ip",
        }),
      ),
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {
        rateLimitBucket: {},
      },
    }));

    const { getRequestIp } = await import("@/services/rate-limit");

    await expect(getRequestIp()).resolves.toBe("unknown");
  });

  it("creates a bucket for a first request", async () => {
    const create = vi.fn().mockResolvedValue(undefined);

    vi.doMock("next/headers", () => ({
      headers: vi.fn(),
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {
        rateLimitBucket: {
          findUnique: vi.fn().mockResolvedValue(null),
          create,
        },
      },
    }));

    const { consumeRateLimit } = await import("@/services/rate-limit");

    await expect(
      consumeRateLimit({
        action: "login",
        blockMs: 60_000,
        identifier: "user@example.com",
        limit: 5,
        windowMs: 60_000,
      }),
    ).resolves.toBeUndefined();

    expect(create).toHaveBeenCalled();
  });

  it("blocks requests that exceed the allowed limit", async () => {
    const update = vi.fn().mockResolvedValue(undefined);

    vi.doMock("next/headers", () => ({
      headers: vi.fn(),
    }));
    vi.doMock("@/db/prisma", () => ({
      default: {
        rateLimitBucket: {
          findUnique: vi.fn().mockResolvedValue({
            key: "login:user@example.com",
            count: 5,
            windowStart: new Date(),
            blockedUntil: null,
          }),
          update,
        },
      },
    }));

    const { RateLimitError, consumeRateLimit } = await import(
      "@/services/rate-limit"
    );

    await expect(
      consumeRateLimit({
        action: "login",
        blockMs: 30_000,
        identifier: "user@example.com",
        limit: 5,
        windowMs: 60_000,
      }),
    ).rejects.toBeInstanceOf(RateLimitError);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          blockedUntil: expect.any(Date),
          count: 6,
        }),
      }),
    );
  });
});
