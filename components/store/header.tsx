import { getSettings } from "@/actions/settings";
import { getCategories } from "@/actions/categories";
import HeaderClient from "./HeaderClient";

export default async function StoreHeader() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategories(),
  ]);

  return <HeaderClient settings={settings} categories={categories} />;
}
