"use server";

import { destroyCurrentAdminSession } from "@/services/admin-session";

export async function logoutAdmin() {
  await destroyCurrentAdminSession();
  return { success: true };
}
