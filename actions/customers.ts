"use server";

import CustomerDB from "@/db/customer";
import { requireAdminAuth } from "@/services/zauth";

export async function getCustomers({ page = 1, limit = 10, search = '' } = {}) {
  await requireAdminAuth();
  return await CustomerDB.list({ page, limit, search });
}
