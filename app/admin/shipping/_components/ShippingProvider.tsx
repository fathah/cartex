"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { message } from "antd";
import { getShippingProfiles, getShippingZones } from "@/actions/shipping";
import { getMarkets } from "@/actions/market";

interface ShippingContextProps {
  profiles: any[];
  zones: any[];
  loading: boolean;
  marketOptions: { label: string; value: string }[];
  refreshProfiles: () => Promise<void>;
  fetchZones: () => Promise<void>;
}

const ShippingContext = createContext<ShippingContextProps | undefined>(
  undefined,
);

export function ShippingProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketOptions, setMarketOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await getShippingZones();
      setZones(data);
    } catch {
      message.error("Failed to load shipping zones");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfiles = async () => {
    try {
      setProfiles(await getShippingProfiles());
    } catch {
      message.error("Failed to load shipping profiles");
    }
  };

  useEffect(() => {
    fetchZones();
    refreshProfiles();
  }, []);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const markets = await getMarkets();
        setMarketOptions(
          markets
            .filter((market: any) => market.isActive)
            .map((market: any) => ({
              label: `${market.name} (${market.currencyCode})`,
              value: market.countryCode || market.code,
            })),
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchMarkets();
  }, []);

  return (
    <ShippingContext.Provider
      value={{
        profiles,
        zones,
        loading,
        marketOptions,
        refreshProfiles,
        fetchZones,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
}

export function useShipping() {
  const context = useContext(ShippingContext);
  if (context === undefined) {
    throw new Error("useShipping must be used within a ShippingProvider");
  }
  return context;
}
