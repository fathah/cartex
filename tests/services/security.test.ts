import { beforeEach, describe, expect, it, vi } from "vitest";

describe("services/security", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.JWT_SECRET = "jwt-secret";
    process.env.APP_CONFIG_ENCRYPTION_KEY = "enc-secret";
  });

  it("normalizes email addresses", async () => {
    const { normalizeEmail } = await import("@/services/security");

    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("generates a six digit OTP code", async () => {
    const { generateOtpCode } = await import("@/services/security");

    expect(generateOtpCode()).toMatch(/^\d{6}$/);
  });

  it("hashes and verifies OTP values", async () => {
    const { hashOtp, verifyOtpHash } = await import("@/services/security");

    const otpHash = hashOtp("user@example.com", "123456");

    expect(verifyOtpHash("user@example.com", "123456", otpHash)).toBe(true);
    expect(verifyOtpHash("user@example.com", "654321", otpHash)).toBe(false);
  });

  it("rejects unsupported uploads", async () => {
    const { validateMediaUpload } = await import("@/services/security");

    expect(() =>
      validateMediaUpload({
        fileName: "malware.exe",
        mimeType: "application/octet-stream",
        size: 1024,
      }),
    ).toThrow("Unsupported file type");
  });

  it("builds sanitized storage file names", async () => {
    const { buildStorageFileName } = await import("@/services/security");

    const fileName = buildStorageFileName("avatar.PNG<script>", "image/png");

    expect(fileName).toMatch(/^media\/\d{4}\/\d{2}\/.+\.pngscript$/);
  });
});
