"use server";

import ProductBrandDB from "@/db/brand";
import { requireAdminAuth } from "@/services/zauth";
import { revalidatePath } from "next/cache";

export async function getBrands() {
  const result = await ProductBrandDB.list();
  return JSON.parse(JSON.stringify(result));
}

export async function getBrand(id: string) {
  const result = await ProductBrandDB.findById(id);
  return JSON.parse(JSON.stringify(result));
}

export async function createBrand(name: string, logo?: string) {
  await requireAdminAuth();
  const brand = await ProductBrandDB.create(name, logo);
  revalidatePath("/admin/products/new");
  revalidatePath("/admin/brands");
  return brand;
}

export async function updateBrand(
  id: string,
  name?: string,
  logo?: string | null,
) {
  await requireAdminAuth();
  const brand = await ProductBrandDB.update(id, name, logo);
  revalidatePath("/admin/products/new");
  revalidatePath("/admin/brands");
  return brand;
}

export async function deleteBrand(id: string) {
  await requireAdminAuth();
  await ProductBrandDB.delete(id);
  revalidatePath("/admin/products/new");
  revalidatePath("/admin/brands");
}
