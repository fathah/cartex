import { beforeEach, describe, expect, it, vi } from "vitest";

describe("actions/checkout", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("forces saved addresses onto the authenticated customer", async () => {
    const create = vi.fn().mockResolvedValue({ id: "address_1" });

    vi.doMock("@/db/address", () => ({
      default: {
        create,
      },
    }));
    vi.doMock("@/db/customer", () => ({
      default: {},
    }));
    vi.doMock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));
    vi.doMock("@/actions/user", () => ({
      getCurrentUser: vi.fn().mockResolvedValue({
        id: "customer_current",
      }),
    }));

    const { saveAddress } = await import("@/actions/checkout");

    await saveAddress({
      addressLine1: "123 Test Street",
      city: "Dubai",
      country: "AE",
      customerId: "customer_other",
      firstName: "Test",
      label: "Home",
      phone: "+971500000000",
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "customer_current",
      }),
    );
  });
});
