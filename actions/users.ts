"use server";

import UserDB from "@/db/user";
import { canManageAdminRole, requireAdminAuth } from "@/services/zauth";
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
  const session = await requireAdminAuth();
  if (!canManageAdminRole(session, role)) {
    throw new Error("Forbidden");
  }

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
  const session = await requireAdminAuth();
  const targetUser = await UserDB.findById(userId);
  if (!targetUser || targetUser.deletedAt) {
    throw new Error("User not found");
  }

  if (!canManageAdminRole(session, targetUser.role)) {
    throw new Error("Forbidden");
  }

  if (session.userId === userId) {
    throw new Error("You cannot remove your own account");
  }

  await UserDB.softDelete(userId);
  revalidatePath("/admin/settings");
  return { success: true };
}
