"use server";

import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

export async function getPage(id: string) {
  return await prisma.page.findUnique({
    where: { id },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function addBlock(pageId: string, type: string, config: any) {
  await requireAdminAuth();
  try {
    // Get current max order
    const lastBlock = await prisma.pageBlock.findFirst({
      where: { pageId },
      orderBy: { order: "desc" },
    });
    const newOrder = (lastBlock?.order ?? -1) + 1;

    const block = await prisma.pageBlock.create({
      data: {
        pageId,
        blockType: type,
        config,
        order: newOrder,
      },
    });
    revalidatePath(`/admin/pages/${pageId}`);
    return { success: true, data: block };
  } catch (error) {
    console.error("Failed to add block:", error);
    return { success: false, error: "Failed to add block" };
  }
}

export async function updateBlock(id: string, config: any) {
  await requireAdminAuth();
  try {
    const block = await prisma.pageBlock.update({
      where: { id },
      data: { config },
    });
    revalidatePath(`/admin/pages/${block.pageId}`);
    return { success: true, data: block };
  } catch (error) {
    console.error("Failed to update block:", error);
    return { success: false, error: "Failed to update block" };
  }
}

export async function deleteBlock(id: string) {
  await requireAdminAuth();
  try {
    const block = await prisma.pageBlock.delete({
      where: { id },
    });
    revalidatePath(`/admin/pages/${block.pageId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete block:", error);
    return { success: false, error: "Failed to delete block" };
  }
}

export async function reorderBlocks(pageId: string, blockIds: string[]) {
  await requireAdminAuth();
  try {
    const updates = blockIds.map((id, index) =>
      prisma.pageBlock.update({
        where: { id },
        data: { order: index },
      }),
    );
    await prisma.$transaction(updates);
    revalidatePath(`/admin/pages/${pageId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder blocks:", error);
    return { success: false, error: "Failed to reorder blocks" };
  }
}
