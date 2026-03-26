"use server";

import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";
import { PAGE_PRESETS } from "@/constants/page-presets";

function generateRandomString(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createPageFromPreset(presetId: string) {
  await requireAdminAuth();

  const preset = PAGE_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return { success: false, error: "Preset not found" };
  }

  try {
    let slug = preset.slug;

    // Check for slug collision
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      slug = `${preset.slug}-${generateRandomString(4)}`;
    }

    // Create the page
    const page = await prisma.page.create({
      data: {
        name: preset.name,
        slug: slug,
        isPublished: false,
        blocks: {
          create: [
            {
              blockType: "TEXT",
              order: 0,
              config: {
                content: preset.content,
              },
            },
          ],
        },
      },
    });

    revalidatePath("/admin/pages");
    return { success: true, data: page };
  } catch (error) {
    console.error("Failed to create page from preset:", error);
    return { success: false, error: "Failed to create page" };
  }
}
