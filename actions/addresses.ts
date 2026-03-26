"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import AddressDB, { type CreateAddressData } from "@/db/address";
import { getCurrentUser } from "./user";

const addressSchema = z.object({
  address1: z.string().trim().min(1, "Address is required"),
  address2: z.string().trim().optional(),
  addressType: z.string().trim().default("HOME"),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
  fullname: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  province: z.string().trim().optional(),
  type: z.string().trim().default("SHIPPING"),
  zip: z.string().trim().optional(),
});

async function getCustomerId() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user.id;
}

function parseAddressForm(formData: FormData) {
  return addressSchema.parse({
    address1: formData.get("address1"),
    address2: formData.get("address2") || undefined,
    addressType: formData.get("addressType") || "HOME",
    city: formData.get("city"),
    country: formData.get("country"),
    fullname: formData.get("fullName"),
    phone: formData.get("phone"),
    province: formData.get("province") || undefined,
    type: formData.get("type") || "SHIPPING",
    zip: formData.get("zip") || undefined,
  });
}

export async function getAddresses() {
  const customerId = await getCustomerId();
  return AddressDB.listByCustomer(customerId);
}

export async function addAddress(formData: FormData) {
  const customerId = await getCustomerId();
  const parsed = parseAddressForm(formData);

  await AddressDB.create({
    ...parsed,
    customerId,
  } satisfies CreateAddressData);

  revalidatePath("/account/addresses");
}

export async function deleteAddress(id: string) {
  const customerId = await getCustomerId();
  const result = await AddressDB.deleteByCustomer(id, customerId);
  if (!result.count) {
    throw new Error("Address not found");
  }

  revalidatePath("/account/addresses");
}

export async function updateAddress(id: string, formData: FormData) {
  const customerId = await getCustomerId();
  const parsed = parseAddressForm(formData);
  const result = await AddressDB.updateByCustomer(id, customerId, parsed);

  if (!result.count) {
    throw new Error("Address not found");
  }

  revalidatePath("/account/addresses");
}
