"use server";

import ProductDB, { CreateProductData } from "@/db/product";
import { Prisma, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAuth } from "@/services/zauth";

export async function getProducts(
  page = 1,
  limit = 20,
  status?: ProductStatus,
) {
  const result = await ProductDB.list(page, limit, status);
  return JSON.parse(JSON.stringify(result));
}

export async function getDeals(page = 1, limit = 20, status?: ProductStatus) {
  const result = await ProductDB.listDeals(page, limit, status);
  return JSON.parse(JSON.stringify(result));
}

export async function getFeaturedProducts(limit = 4) {
  const result = await ProductDB.listFeatured(limit);
  return JSON.parse(JSON.stringify(result));
}

export async function getBrandProducts(
  brandId: string,
  page = 1,
  limit = 20,
  status?: ProductStatus,
) {
  const result = await ProductDB.listByBrandId(brandId, page, limit, status);
  return JSON.parse(JSON.stringify(result));
}

export async function getProduct(id: string) {
  const result = await ProductDB.findById(id);
  return JSON.parse(JSON.stringify(result));
}

export async function getProductBySlug(slug: string) {
  const result = await ProductDB.findBySlug(slug);
  return JSON.parse(JSON.stringify(result));
}

export async function createProduct(data: CreateProductData) {
  await requireAdminAuth();
  const product = await ProductDB.create(data);
  revalidatePath("/admin/products");
  return product; // Return product to redirect client-side or we can redirect here
}

export async function updateProduct(
  id: string,
  data: Prisma.ProductUpdateInput,
) {
  await requireAdminAuth();
  const product = await ProductDB.update(id, data);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return product;
}

export async function deleteProduct(id: string) {
  await requireAdminAuth();
  await ProductDB.delete(id);
  revalidatePath("/admin/products");
}

export async function addOption(
  productId: string,
  name: string,
  values: string[],
) {
  await requireAdminAuth();
  await ProductDB.addOption(productId, name, values);
  await ProductDB.generateVariants(productId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function generateVariants(productId: string) {
  await requireAdminAuth();
  await ProductDB.generateVariants(productId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariant(
  variantId: string,
  data: {
    originalPrice: number;
    salePrice: number;
    sku?: string;
    inventory: number;
  },
) {
  await requireAdminAuth();
  const variant = await ProductDB.updateVariant(variantId, data);
  revalidatePath("/admin/products");
  return variant;
}

export async function addMedia(
  productId: string,
  url: string,
  type: "IMAGE" | "VIDEO" = "IMAGE",
) {
  await requireAdminAuth();
  const media = await ProductDB.addMedia(productId, url, type);
  revalidatePath(`/admin/products/${productId}`);
  return media;
}

export async function linkMedia(productId: string, mediaId: string) {
  await requireAdminAuth();
  const mediaLink = await ProductDB.linkMedia(productId, mediaId);
  revalidatePath(`/admin/products/${productId}`);
  return mediaLink;
}

export async function removeMedia(mediaId: string, productId: string) {
  await requireAdminAuth();
  await ProductDB.removeMedia(mediaId, productId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function checkSlugAvailability(slug: string, excludeId?: string) {
  const product = await ProductDB.findBySlug(slug);
  if (product && excludeId && product.id === excludeId) {
    return true; // Still available if it's the same product
  }
  return !product;
}
