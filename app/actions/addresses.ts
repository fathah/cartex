"use server";

import AddressDB, { CreateAddressData } from "@/db/address";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user";

async function getCustomerId() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user.id;
}

export async function getAddresses() {
  const customerId = await getCustomerId();
  return await AddressDB.listByCustomer(customerId);
}

export async function addAddress(formData: FormData) {
  const customerId = await getCustomerId();

  const data: CreateAddressData = {
    customerId,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    address1: formData.get("address1") as string,
    city: formData.get("city") as string,
    country: formData.get("country") as string,
    phone: formData.get("phone") as string,
    // Optional fields
    address2: (formData.get("address2") as string) || undefined,
    type: "SHIPPING", // Default
  };

  if (!data.address1 || !data.city || !data.country || !data.firstName) {
    throw new Error("Missing required fields");
  }

  await AddressDB.create(data);
  revalidatePath("/account/addresses");
}

export async function deleteAddress(id: string) {
  await AddressDB.delete(id);
  revalidatePath("/account/addresses");
}

export async function updateAddress(id: string, formData: FormData) {
  const data: Partial<CreateAddressData> = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    address1: formData.get("address1") as string,
    city: formData.get("city") as string,
    country: formData.get("country") as string,
    phone: formData.get("phone") as string,
    address2: (formData.get("address2") as string) || undefined,
  };

  await AddressDB.update(id, data);
  revalidatePath("/account/addresses");
}
