"use server";

import ProductDB, { CreateProductData } from "@/db/product";
import { Prisma, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";
import { resolveCurrentMarket } from "@/lib/market";
import { applyMarketPricingToProduct } from "@/lib/product-market";

export async function getProducts(
  page = 1,
  limit = 20,
  status?: ProductStatus,
) {
  const market = await resolveCurrentMarket();
  const result = await ProductDB.list(page, limit, status, market?.id);
  const products = result.products
    .map((product: any) => applyMarketPricingToProduct(product))
    .filter((product: any) => product && !product.unavailableInMarket);
  return JSON.parse(
    JSON.stringify({
      ...result,
      products,
      total: products.length,
      totalPages: Math.ceil(products.length / limit),
    }),
  );
}

export async function getDeals(page = 1, limit = 20, status?: ProductStatus) {
  const market = await resolveCurrentMarket();
  const result = await ProductDB.listDeals(page, limit, status, market?.id);
  const products = result.products
    .map((product: any) => applyMarketPricingToProduct(product))
    .filter((product: any) => product && !product.unavailableInMarket)
    .filter((product: any) => {
      const variant = product.variants?.[0];
      if (!variant) return false;
      return (
        Number(variant.effectiveSalePrice || 0) > 0 &&
        Number(variant.effectiveSalePrice || 0) <
          Number(variant.effectiveCompareAtPrice || 0)
      );
    })
    .sort(
      (a: any, b: any) =>
        Number(a.defaultVariant?.effectiveSalePrice || 0) -
        Number(b.defaultVariant?.effectiveSalePrice || 0),
    );
  return JSON.parse(
    JSON.stringify({
      ...result,
      products,
      total: products.length,
      totalPages: Math.ceil(products.length / limit),
    }),
  );
}

export async function getFeaturedProducts(limit = 4) {
  const market = await resolveCurrentMarket();
  const result = await ProductDB.listFeatured(limit, market?.id);
  return JSON.parse(
    JSON.stringify(
      result
        .map((product: any) => applyMarketPricingToProduct(product))
        .filter((product: any) => product && !product.unavailableInMarket),
    ),
  );
}

export async function getBrandProducts(
  brandId: string,
  page = 1,
  limit = 20,
  status?: ProductStatus,
) {
  const market = await resolveCurrentMarket();
  const result = await ProductDB.listByBrandId(
    brandId,
    page,
    limit,
    status,
    market?.id,
  );
  const products = result.products
    .map((product: any) => applyMarketPricingToProduct(product))
    .filter((product: any) => product && !product.unavailableInMarket);
  return JSON.parse(
    JSON.stringify({
      ...result,
      products,
      total: products.length,
      totalPages: Math.ceil(products.length / limit),
    }),
  );
}

export async function getCollectionProducts(
  collectionId: string,
  page = 1,
  limit = 20,
  status?: ProductStatus,
) {
  const result = await ProductDB.listByCollectionId(
    collectionId,
    page,
    limit,
    status,
    (await resolveCurrentMarket())?.id,
  );
  const products = result.products
    .map((product: any) => applyMarketPricingToProduct(product))
    .filter((product: any) => product && !product.unavailableInMarket);
  return JSON.parse(
    JSON.stringify({
      ...result,
      products,
      total: products.length,
      totalPages: Math.ceil(products.length / limit),
    }),
  );
}

export async function getProductsByIds(ids: string[]) {
  const market = await resolveCurrentMarket();
  const result = await ProductDB.listByIds(ids, market?.id);
  return JSON.parse(
    JSON.stringify(
      result
        .map((product: any) => applyMarketPricingToProduct(product))
        .filter((product: any) => product && !product.unavailableInMarket),
    ),
  );
}

export async function getProduct(id: string) {
  const result = await ProductDB.findById(id);
  return JSON.parse(JSON.stringify(result));
}

export async function getProductBySlug(slug: string) {
  const market = await resolveCurrentMarket();
  const result = await ProductDB.findBySlug(slug, market?.id);
  const product = result ? applyMarketPricingToProduct(result) : null;
  return JSON.parse(JSON.stringify(product));
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

export async function updateOption(
  productId: string,
  optionId: string,
  name: string,
  values: string[],
) {
  await requireAdminAuth();
  await ProductDB.updateOption(optionId, name, values);
  await ProductDB.syncVariants(productId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteOption(productId: string, optionId: string) {
  await requireAdminAuth();
  await ProductDB.deleteOption(optionId);
  await ProductDB.syncVariants(productId);
  revalidatePath("/admin/products");
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
    salePrice: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    sku?: string;
    inventory: number;
    marketPrices?: Array<{
      marketId: string;
      salePrice: number;
      compareAtPrice?: number | null;
      costPrice?: number | null;
      inventoryQuantity?: number | null;
      isAvailable?: boolean;
      isPublished?: boolean;
    }>;
  },
) {
  await requireAdminAuth();
  const variant = await ProductDB.updateVariant(variantId, data);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${variant.productId}`);
  return variant;
}

export async function deleteVariant(variantId: string) {
  await requireAdminAuth();
  const variant = await ProductDB.deleteVariant(variantId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${variant.productId}`);
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
