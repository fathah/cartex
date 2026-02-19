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
  firstName?: string,
  lastName?: string,
) {
  await requireAdminAuth();

  const existingUser = await UserDB.findByEmail(email);
  if (existingUser) {
    if (existingUser.deletedAt) {
      // Reactivate user
      await UserDB.update(existingUser.id, {
        deletedAt: null,
        role,
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
      });
      revalidatePath("/admin/settings");
      return { success: true };
    }
    return { success: false, error: "User already exists" };
  }

  await UserDB.create({
    email,
    role,
    firstName,
    lastName,
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
