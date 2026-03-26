"use server";

import SettingsDB, { UpdateSettingsData } from "@/db/settings";
import ConfigDB, { AIAutomationConfigData } from "@/db/config";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

export async function getSettings() {
  return await SettingsDB.get();
}

export async function getAIAutomationSettings() {
  await requireAdminAuth();
  return await ConfigDB.getAIAutomationSettings();
}

export async function updateSettings(data: UpdateSettingsData) {
  await requireAdminAuth();
  const settings = await SettingsDB.update(data);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return settings;
}

export async function updateAIAutomationSettings(
  data: AIAutomationConfigData,
) {
  await requireAdminAuth();
  const settings = await ConfigDB.updateAIAutomationSettings(data);
  revalidatePath("/admin/settings");
  return settings;
}
