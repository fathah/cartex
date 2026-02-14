"use server";

import CustomerDB from "@/db/customer";

export async function getCustomers({ page = 1, limit = 10, search = '' } = {}) {
  return await CustomerDB.list({ page, limit, search });
}
