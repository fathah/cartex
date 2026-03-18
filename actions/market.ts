"use server";

import MarketDB from "@/db/market";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

export async function getMarkets() {
  const markets = await MarketDB.list();
  return JSON.parse(JSON.stringify(markets));
}

export async function createMarket(data: {
  name: string;
  code: string;
  countryCode: string;
  currencyCode: string;
}) {
  await requireAdminAuth();
  const market = await MarketDB.create(data);
  revalidatePath("/admin/settings");
  return JSON.parse(JSON.stringify(market));
}

export async function updateMarket(
  id: string,
  data: { name?: string; isActive?: boolean },
) {
  await requireAdminAuth();
  const market = await MarketDB.update(id, data);
  revalidatePath("/admin/settings");
  return JSON.parse(JSON.stringify(market));
}

export async function deleteMarket(id: string) {
  await requireAdminAuth();
  await MarketDB.delete(id);
  revalidatePath("/admin/settings");
}
