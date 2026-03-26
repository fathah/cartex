export type ShippingCarrierOption = {
  code: string;
  label: string;
  markets: string[];
  services: string[];
};

export const SHIPPING_CARRIER_OPTIONS: ShippingCarrierOption[] = [
  {
    code: "manual",
    label: "Manual Rules",
    markets: ["GLOBAL"],
    services: [],
  },
  {
    code: "shiprocket",
    label: "Shiprocket",
    markets: ["IN"],
    services: ["surface", "air", "express"],
  },
  {
    code: "delhivery",
    label: "Delhivery",
    markets: ["IN"],
    services: ["surface", "express"],
  },
  {
    code: "bluedart",
    label: "Blue Dart",
    markets: ["IN"],
    services: ["domestic_priority", "dart_apex"],
  },
  {
    code: "aramex",
    label: "Aramex",
    markets: ["AE", "SA", "KW", "QA", "BH", "OM", "IN"],
    services: ["domestic", "express", "international"],
  },
  {
    code: "imile",
    label: "iMile",
    markets: ["AE", "SA"],
    services: ["standard", "express", "cod"],
  },
  {
    code: "dhl_express",
    label: "DHL Express",
    markets: ["GLOBAL"],
    services: ["express_worldwide"],
  },
  {
    code: "easyship",
    label: "Easyship",
    markets: ["GLOBAL"],
    services: ["standard", "express", "economy"],
  },
] as const;

export const SHIPPING_STARTER_PLAYBOOKS = [
  {
    code: "gcc",
    title: "GCC Starter",
    description:
      "Creates UAE and GCC starter zones, standard shipping profiles, and carrier-ready methods built for Aramex and iMile workflows.",
    focus: "Best for UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, and Oman.",
    providers: ["aramex", "imile"],
  },
  {
    code: "india",
    title: "India Starter",
    description:
      "Creates India domestic starter zones, standard shipping profiles, and carrier-ready methods built for Shiprocket, Delhivery, and Blue Dart.",
    focus: "Best for domestic India shipping with manual or aggregator-first setups.",
    providers: ["shiprocket", "delhivery", "bluedart"],
  },
] as const;

export function getCarrierOption(providerCode?: string | null) {
  if (!providerCode) {
    return null;
  }

  return (
    SHIPPING_CARRIER_OPTIONS.find((option) => option.code === providerCode) ||
    null
  );
}

export function getCarrierServiceOptions(providerCode?: string | null) {
  const provider = getCarrierOption(providerCode);

  return provider?.services || [];
}
