"use server";

import prisma from "@/db/prisma"; // Direct prisma usage for now as per plan, or ideally checking if db/media exists.
// However, the plan said "Create createMedia action to save media records to Prisma."
// I will create simple action first.

import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

export async function createMedia(
  url: string,
  type: "IMAGE" | "VIDEO" = "IMAGE",
  alt?: string,
) {
  try {
    await requireAdminAuth();
    const media = await prisma.media.create({
      data: {
        url,
        type,
        alt: alt || "",
      },
    });
    revalidatePath("/admin/media");
    return { success: true, data: media };
  } catch (error) {
    console.error("Failed to create media:", error);
    return { success: false, error: "Failed to create media record" };
  }
}

export async function getMedia() {
  return await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });
}
