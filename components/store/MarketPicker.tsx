"use client";

import React from "react";
import { Select } from "antd";
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

  return (
    <div className="flex flex-col items-center gap-3 border-t border-gray-200 pt-6">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <Globe size={16} />
        <span>Country / Market</span>
      </div>

      <Select
        value={marketCode || undefined}
        loading={loading}
        placeholder="Select country"
        className="w-full max-w-sm"
        onChange={(value) => {
          const selectedMarket = markets.find((market) => market.code === value);
          if (!selectedMarket) return;

          setMarketCode(selectedMarket.code);
          setCurrency(selectedMarket.currencyCode);
          window.location.reload();
        }}
        options={markets.map((market) => ({
          value: market.code,
          label: (
            <div className="flex items-center gap-2">
              <span>{countryCodeToFlag(market.countryCode || market.code)}</span>
              <span>
                {market.name} ({market.currencyCode})
              </span>
            </div>
          ),
        }))}
      />
    </div>
  );
}
