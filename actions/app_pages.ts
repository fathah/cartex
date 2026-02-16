"use server";

import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

export async function getPages() {
  return await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createPage(data: {
  name: string;
  slug: string;
  isPublished?: boolean;
}) {
  await requireAdminAuth();
  try {
    const page = await prisma.page.create({
      data: {
        name: data.name,
        slug: data.slug,
        isPublished: data.isPublished || false,
      },
    });
    revalidatePath("/admin/pages");
    return { success: true, data: page };
  } catch (error) {
    if ((error as any).code === "P2002") {
      // Prisma unique constraint error
      return { success: false, error: "Slug already exists" };
    }
    console.error("Failed to create page:", error);
    return { success: false, error: "Failed to create page" };
  }
}

export async function updatePage(
  id: string,
  data: { name?: string; slug?: string; isPublished?: boolean },
) {
  await requireAdminAuth();
  try {
    const page = await prisma.page.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/pages");
    return { success: true, data: page };
  } catch (error) {
    console.error("Failed to update page:", error);
    return { success: false, error: "Failed to update page" };
  }
}

export async function deletePage(id: string) {
  await requireAdminAuth();
  try {
    await prisma.page.delete({
      where: { id },
    });
    revalidatePath("/admin/pages");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete page:", error);
    return { success: false, error: "Failed to delete page" };
  }
}

export async function checkPageSlugAvailability(
  slug: string,
  excludeId?: string,
) {
  await requireAdminAuth();
  const page = await prisma.page.findUnique({
    where: { slug },
  });

  if (page && excludeId && page.id === excludeId) {
    return true;
  }

  return !page;
}
