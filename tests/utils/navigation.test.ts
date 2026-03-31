import { describe, expect, it } from "vitest";
import { sanitizeInternalRedirectPath } from "@/utils/navigation";

describe("utils/navigation", () => {
  it("accepts internal absolute paths", () => {
    expect(sanitizeInternalRedirectPath("/checkout")).toBe("/checkout");
    expect(sanitizeInternalRedirectPath("/account/orders?id=1")).toBe(
      "/account/orders?id=1",
    );
  });

  it("rejects external and malformed redirect targets", () => {
    expect(sanitizeInternalRedirectPath("https://evil.example")).toBeNull();
    expect(sanitizeInternalRedirectPath("//evil.example")).toBeNull();
    expect(sanitizeInternalRedirectPath("checkout")).toBeNull();
    expect(sanitizeInternalRedirectPath("/safe\nX-Injected: true")).toBeNull();
  });
});
