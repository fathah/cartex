import { headers, cookies } from "next/headers";
import prisma from "@/db/prisma";
import SettingsDB from "@/db/settings";

export const MARKET_COOKIE_NAME = "market";
export const CURRENCY_COOKIE_NAME = "currency";

export type ResolvedMarket = {
  id: string;
  code: string;
  countryCode: string;
  currencyCode: string;
  name: string;
  source: "cookie" | "geo" | "default";
};

type MarketRecord = {
  id: string;
  code: string;
  countryCode: string;
  currencyCode: string;
  name: string;
  isActive: boolean;
};

async function getActiveMarkets(): Promise<MarketRecord[]> {
  return prisma.market.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "asc" }],
  });
}

function normalizeCountryCode(value?: string | null) {
  return value?.trim().toUpperCase() || null;
}

function mapMarket(market: MarketRecord, source: ResolvedMarket["source"]): ResolvedMarket {
  return {
    id: market.id,
    code: market.code,
    countryCode: market.countryCode,
    currencyCode: market.currencyCode,
    name: market.name,
    source,
  };
}

export async function resolveCurrentMarket(): Promise<ResolvedMarket | null> {
  const [marketStore, headerStore, activeMarkets, settings] = await Promise.all([
    cookies(),
    headers(),
    getActiveMarkets(),
    SettingsDB.get(),
  ]);

  if (activeMarkets.length === 0) {
    return null;
  }

  const cookieMarketCode = normalizeCountryCode(
    marketStore.get(MARKET_COOKIE_NAME)?.value,
  );
  if (cookieMarketCode) {
    const cookieMatch = activeMarkets.find(
      (market) =>
        market.code === cookieMarketCode || market.countryCode === cookieMarketCode,
    );
    if (cookieMatch) {
      return mapMarket(cookieMatch, "cookie");
    }
  }

  const geoCountryCode = normalizeCountryCode(
    headerStore.get("x-vercel-ip-country") ||
      headerStore.get("cf-ipcountry") ||
      headerStore.get("x-country-code") ||
      headerStore.get("x-app-country"),
  );
  if (geoCountryCode) {
    const geoMatch = activeMarkets.find(
      (market) =>
        market.countryCode === geoCountryCode || market.code === geoCountryCode,
    );
    if (geoMatch) {
      return mapMarket(geoMatch, "geo");
    }
  }

  const settingsCurrency = settings.currency?.trim().toUpperCase();
  const defaultMarket =
    activeMarkets.find((market) => market.currencyCode === settingsCurrency) ||
    activeMarkets[0];

  return mapMarket(defaultMarket, "default");
}
