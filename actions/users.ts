"use server";

import UserDB from "@/db/user";
import { requireAdminAuth } from "@/services/zauth";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAdminUsers() {
  await requireAdminAuth();
  return await UserDB.list();
}

export async function addAdminUser(
  email: string,
  role: UserRole,
  fullname?: string,
) {
  await requireAdminAuth();

  const emailLower = email.toLowerCase();

  const existingUser = await UserDB.findByEmail(emailLower);
  if (existingUser) {
    if (existingUser.deletedAt) {
      // Reactivate user
      await UserDB.update(existingUser.id, {
        deletedAt: null,
        role,
        fullname: fullname || existingUser.fullname,
      });
      revalidatePath("/admin/settings");
      return { success: true };
    }
    return { success: false, error: "User already exists" };
  }

  await UserDB.create({
    email: emailLower,
    role,
    fullname,
    ziqxId: undefined, // Will be linked on first login
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function removeAdminUser(userId: string) {
  await requireAdminAuth();
  // Prevent removing own access (optional check, but good practice)
  // For now, just soft delete
  await UserDB.softDelete(userId);
  revalidatePath("/admin/settings");
  return { success: true };
}
