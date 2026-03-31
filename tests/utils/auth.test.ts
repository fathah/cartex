import { beforeEach, describe, expect, it, vi } from "vitest";

describe("utils/auth", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns false for invalid tokens instead of throwing", async () => {
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: "bad-token" }),
      }),
    }));
    vi.doMock("@/services/token_service", () => ({
      default: {
        verifyJWT: vi.fn().mockRejectedValue(new Error("Invalid token")),
      },
    }));

    const { checkUserAuth } = await import("@/utils/auth");

    await expect(checkUserAuth()).resolves.toBe(false);
  });

  it("sets the auth cookie with secure defaults", async () => {
    const set = vi.fn();

    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue({
        set,
      }),
    }));
    vi.doMock("@/services/token_service", () => ({
      default: {
        verifyJWT: vi.fn(),
      },
    }));

    const { setAuthToken } = await import("@/utils/auth");

    await setAuthToken("jwt-token");

    expect(set).toHaveBeenCalledWith(
      expect.any(String),
      "jwt-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      }),
    );
  });
});
