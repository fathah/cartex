import { beforeEach, describe, expect, it, vi } from "vitest";

describe("db/shipping", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("deletes dependent rates before deleting a shipping method", async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 2 });
    const deleteMethod = vi.fn().mockResolvedValue({ id: "method_1" });

    vi.doMock("@/db/prisma", () => ({
      default: {
        $transaction: vi.fn(async (callback: any) =>
          callback({
            shippingMethod: {
              delete: deleteMethod,
            },
            shippingRate: {
              deleteMany,
            },
          }),
        ),
      },
    }));

    const { ShippingDB } = await import("@/db/shipping");

    await ShippingDB.deleteMethod("method_1");

    expect(deleteMany).toHaveBeenCalledWith({
      where: { shippingMethodId: "method_1" },
    });
    expect(deleteMethod).toHaveBeenCalledWith({
      where: { id: "method_1" },
    });
  });
});
