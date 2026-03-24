"use server";

import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

export async function getSectionConfig(key: string) {
  const config = await prisma.config.findUnique({
    where: { key },
  });

  if (!config) return null;

  try {
    return JSON.parse(config.value);
  } catch (e) {
    console.error(`Failed to parse config for ${key}:`, e);
    return null;
  }
}

export async function getSectionConfigs(keys: string[]) {
  const configs = await prisma.config.findMany({
    where: { key: { in: keys } },
  });

  const configMap: Record<string, any> = {};
  configs.forEach((c) => {
    try {
      configMap[c.key] = JSON.parse(c.value);
    } catch (e) {
      console.error(`Failed to parse config for ${c.key}:`, e);
    }
  });

  return configMap;
}

export async function updateSectionConfig(key: string, data: any) {
  await requireAdminAuth();
  try {
    const value = JSON.stringify(data);
    const config = await prisma.config.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Revalidate paths that use these global sections
    revalidatePath("/admin/pages");
    revalidatePath("/", "layout"); // Revalidate all pages since Navbar/Footer are global

    return { success: true, data: config };
  } catch (error) {
    console.error(`Failed to update section config for ${key}:`, error);
    return { success: false, error: "Failed to update configuration" };
  }
}
