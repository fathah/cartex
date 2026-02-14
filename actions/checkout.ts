"use server";

import AddressDB, { CreateAddressData } from "@/db/address";
import CustomerDB from "@/db/customer";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user";

export async function getCheckoutData() {
  // Get the authenticated user
  const user = await getCurrentUser();

  if (!user) {
    // Guest checkout - return empty data
    return {
      customer: null,
      addresses: [],
    };
  }

  // Fetch customer with addresses
  const customer = await CustomerDB.findById(user.id);

  if (!customer) {
    return {
      customer: null,
      addresses: [],
    };
  }

  return {
    customer,
    addresses: customer.addresses || [],
  };
}

export async function saveAddress(data: CreateAddressData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required to save address");
  }

  if (!data.customerId) {
    data.customerId = user.id;
  }

  const address = await AddressDB.create(data);
  revalidatePath("/checkout");
  return address;
}
