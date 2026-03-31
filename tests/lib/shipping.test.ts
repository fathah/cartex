import { describe, expect, it } from "vitest";
import { getPreferredShippingSelection } from "@/lib/shipping";

describe("lib/shipping getPreferredShippingSelection", () => {
  it("clears the selection when no methods are available", () => {
    expect(getPreferredShippingSelection([], "express")).toBeNull();
  });

  it("preserves the current method when it still exists", () => {
    expect(
      getPreferredShippingSelection(
        [
          { calculatedPrice: 10, code: "standard", name: "Standard" },
          { calculatedPrice: 25, code: "express", name: "Express" },
        ],
        "express",
      ),
    ).toEqual({
      code: "express",
      cost: 25,
      name: "Express",
    });
  });

  it("falls back to the first available method when the previous one disappears", () => {
    expect(
      getPreferredShippingSelection(
        [
          { calculatedPrice: 10, code: "standard", name: "Standard" },
          { calculatedPrice: 25, code: "express", name: "Express" },
        ],
        "overnight",
      ),
    ).toEqual({
      code: "standard",
      cost: 10,
      name: "Standard",
    });
  });
});
