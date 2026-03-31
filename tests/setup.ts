import { afterEach, beforeEach, vi } from "vitest";

vi.mock("next-runtime-env", () => ({
  env: (key: string) => process.env[key],
}));

beforeEach(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
  process.env.APP_CONFIG_ENCRYPTION_KEY =
    process.env.APP_CONFIG_ENCRYPTION_KEY || "test-encryption-key";
});

afterEach(() => {
  vi.clearAllMocks();
});
