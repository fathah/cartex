"use server";

import { z } from "zod";
import { requireAdminAuth } from "@/services/zauth";
import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";

const importRowSchema = z.object({
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  heightCm: z.coerce.number().min(0).optional(),
  name: z.string().trim().min(1),
  lengthCm: z.coerce.number().min(0).optional(),
  compareAtPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  requiresShipping: z
    .union([z.boolean(), z.string(), z.number()])
    .transform((value) => {
      if (typeof value === "boolean") {
        return value;
      }

      if (typeof value === "number") {
        return value !== 0;
      }

      const normalized = value.trim().toLowerCase();
      return !["0", "false", "no", "n"].includes(normalized);
    })
    .optional(),
  salePrice: z.coerce.number().min(0).default(0),
  shippingProfileCode: z.string().trim().optional(),
  stock: z.coerce.number().int().default(0),
  weightGrams: z.coerce.number().int().min(0).optional(),
  widthCm: z.coerce.number().min(0).optional(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function importProductBatch(rows: unknown[]) {
  await requireAdminAuth();

  const results = [];

  for (const rawRow of rows) {
    try {
      const row = importRowSchema.parse(rawRow);
      let categoryId: string | null = null;
      let brandId: string | null = null;

      if (row.category) {
        let category = await prisma.collection.findFirst({
          where: {
            name: {
              equals: row.category,
              mode: "insensitive",
            },
          },
        });

        if (!category) {
          const baseSlug = slugify(row.category);
          let slug = baseSlug;
          let counter = 1;

          while (await prisma.collection.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter += 1;
          }

          category = await prisma.collection.create({
            data: {
              name: row.category,
              slug,
            },
          });
        }

        categoryId = category.id;
      }

      if (row.brand) {
        let brand = await prisma.productBrand.findFirst({
          where: {
            name: {
              equals: row.brand,
              mode: "insensitive",
            },
          },
        });

        if (!brand) {
          brand = await prisma.productBrand.create({
            data: { name: row.brand },
          });
        }

        brandId = brand.id;
      }

      const baseProductSlug = slugify(row.name);
      let productSlug = baseProductSlug;
      let productCounter = 1;

      while (await prisma.product.findUnique({ where: { slug: productSlug } })) {
        productSlug = `${baseProductSlug}-${productCounter}`;
        productCounter += 1;
      }

      await prisma.$transaction(async (tx) => {
        const shippingProfile = row.shippingProfileCode
          ? await tx.shippingProfile.findFirst({
              where: {
                code: {
                  equals: row.shippingProfileCode,
                  mode: "insensitive",
                },
              },
              select: { id: true },
            })
          : await tx.shippingProfile.findFirst({
              where: { isDefault: true },
              select: { id: true },
            });

        if (row.shippingProfileCode && !shippingProfile) {
          throw new Error(
            `Shipping profile '${row.shippingProfileCode}' was not found`,
          );
        }

        const product = await tx.product.create({
          data: {
            collections: categoryId
              ? {
                  connect: { id: categoryId },
                }
              : undefined,
            name: row.name,
            productBrandId: brandId,
            shippingProfileId: shippingProfile?.id || null,
            slug: productSlug,
            status: "ACTIVE",
          },
        });

        const variant = await tx.productVariant.create({
          data: {
            compareAtPrice: row.compareAtPrice ?? null,
            costPrice: row.costPrice ?? null,
            inventory: {
              create: {
                quantity: row.stock,
              },
            },
            heightCm: row.heightCm ?? null,
            lengthCm: row.lengthCm ?? null,
            productId: product.id,
            requiresShipping: row.requiresShipping ?? true,
            salePrice: row.salePrice,
            sku: "",
            title: "Default Variant",
            weightGrams: row.weightGrams ?? 0,
            widthCm: row.widthCm ?? null,
          },
        });

        const activeMarkets = await tx.market.findMany({
          where: { isActive: true },
          select: { id: true },
        });

        if (activeMarkets.length > 0) {
          await tx.variantMarket.createMany({
            data: activeMarkets.map((market) => ({
              compareAtPrice: row.compareAtPrice ?? null,
              costPrice: row.costPrice ?? null,
              inventoryQuantity: row.stock,
              isAvailable: true,
              isPublished: true,
              marketId: market.id,
              salePrice: row.salePrice,
              variantId: variant.id,
            })),
          });
        }
      });

      results.push({ success: true, name: row.name });
    } catch (error: any) {
      console.error(
        `Failed to import row ${(rawRow as any)?.name || "unknown"}:`,
        error,
      );
      results.push({
        error: error.message,
        name: (rawRow as any)?.name || "unknown",
        success: false,
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/brands");

  return results;
}
