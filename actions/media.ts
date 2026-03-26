"use server";

import { z } from "zod";
import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

const createMediaSchema = z.object({
  alt: z.string().trim().max(255).optional(),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  url: z.string().trim().url(),
});

export async function createMedia(
  url: string,
  type: "IMAGE" | "VIDEO" = "IMAGE",
  alt?: string,
) {
  try {
    await requireAdminAuth();
    const data = createMediaSchema.parse({ alt, type, url });
    const media = await prisma.media.create({
      data,
    });

    revalidatePath("/admin/media");
    return { success: true, data: media };
  } catch (error) {
    console.error("Failed to create media:", error);
    return { success: false, error: "Failed to create media record" };
  }
}

export async function getMedia() {
  await requireAdminAuth();
  return prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });
}
