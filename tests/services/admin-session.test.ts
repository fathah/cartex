import { beforeEach, describe, expect, it, vi } from "vitest";

describe("services/admin-session", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.JWT_SECRET = "session-secret";
  });

  it("creates hashed admin sessions", async () => {
    const create = vi.fn().mockImplementation(async ({ data }) => ({
      id: "session_1",
      ...data,
    }));

    vi.doMock("@/db/prisma", () => ({
      default: {
        adminSession: {
          create,
        },
      },
    }));
    vi.doMock("next/headers", () => ({
      cookies: vi.fn(),
    }));

    const { createAdminSession } = await import("@/services/admin-session");
    const { hashToken } = await import("@/services/security");

    const session = await createAdminSession("user_1");

    expect(session.sessionId).toBe("session_1");
    expect(session.token).toBeTruthy();
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tokenHash: hashToken(session.token),
        userId: "user_1",
      }),
    });
  });

  it("returns null for expired sessions", async () => {
    vi.doMock("@/db/prisma", () => ({
      default: {
        adminSession: {
          findUnique: vi.fn().mockResolvedValue({
            id: "session_1",
            expiresAt: new Date(Date.now() - 1_000),
            revokedAt: null,
            user: {
              id: "user_1",
              deletedAt: null,
              email: "admin@example.com",
              fullname: "Admin",
              role: "ADMIN",
            },
          }),
        },
      },
    }));
    vi.doMock("next/headers", () => ({
      cookies: vi.fn(),
    }));

    const { getAdminSessionByToken } = await import("@/services/admin-session");

    await expect(getAdminSessionByToken("raw-token")).resolves.toBeNull();
  });
});
