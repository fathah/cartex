"use client";

import React from "react";
import { Select, ConfigProvider } from "antd";
import { Globe } from "lucide-react";
import { getMarkets } from "@/actions/market";
import { useCurrency } from "@/components/providers/currency-provider";

function countryCodeToFlag(code?: string) {
  if (!code || code.length !== 2) {
    return "🌐";
  }

  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export default function MarketPicker() {
  const [markets, setMarkets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { marketCode, setMarketCode, setCurrency } = useCurrency();

  React.useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const data = await getMarkets();
        setMarkets(data.filter((market: any) => market.isActive));
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  if (!loading && markets.length === 0) {
    return null;
  }

  const paymentIcons = [
    { name: "Visa", src: "/images/brands/payments/visa.png" },
    { name: "Mastercard", src: "/images/brands/payments/mastercard.png" },
    { name: "American Express", src: "/images/brands/payments/american.png" },
    { name: "Apple Pay", src: "/images/brands/payments/applepay.png" },
    { name: "Google Pay", src: "/images/brands/payments/googlepay.png" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 pb-6 border-t border-white/10 w-full">
      {/* Left Side: Market Picker */}
      <div className="flex flex-col items-center md:items-start gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
          <Globe size={18} className="text-white/70" />
          <span>Country / Market</span>
        </div>

        <ConfigProvider
          theme={{
            token: {
              colorText: "#ffffff",
              colorTextPlaceholder: "rgba(255, 255, 255, 0.45)",
              colorBgContainer: "transparent",
              colorBorder: "transparent",
            },
            components: {
              Select: {
                colorIcon: "rgba(255, 255, 255, 0.45)",
                colorBgElevated: "#1f1f1f", // Dark dropdown background
              },
            },
          }}
        >
          <Select
            value={marketCode || undefined}
            loading={loading}
            placeholder="Select country"
            variant="borderless"
            dropdownStyle={{ minWidth: 200 }}
            className="w-full min-w-[180px] bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            onChange={(value) => {
              const selectedMarket = markets.find(
                (market) => market.code === value,
              );
              if (!selectedMarket) return;

              setMarketCode(selectedMarket.code);
              setCurrency(selectedMarket.currencyCode);
              window.location.reload();
            }}
            options={markets.map((market) => ({
              value: market.code,
              label: (
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {countryCodeToFlag(market.countryCode || market.code)}
                  </span>
                  <span className="font-medium text-white">
                    {market.name} ({market.currencyCode})
                  </span>
                </div>
              ),
            }))}
          />
        </ConfigProvider>
      </div>

      {/* Right Side: Payment Brands */}
      <div className="flex flex-col items-center md:items-end gap-4">
        <div className="flex flex-wrap justify-center md:justify-end gap-3">
          {paymentIcons.map((icon) => (
            <div
              key={icon.name}
              className="bg-white/95 p-1 px-2 rounded flex items-center justify-center hover:bg-white transition-colors"
              title={icon.name}
            >
              <img
                src={icon.src}
                alt={icon.name}
                className="h-5 w-auto object-contain opacity-90 transition-opacity hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
