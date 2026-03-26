"use server";

import { z } from "zod";
import { requireAdminAuth } from "@/services/zauth";
import prisma from "@/db/prisma";
import { revalidatePath } from "next/cache";

const importRowSchema = z.object({
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  name: z.string().trim().min(1),
  originalPrice: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().default(0),
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
        const product = await tx.product.create({
          data: {
            collections: categoryId
              ? {
                  connect: { id: categoryId },
                }
              : undefined,
            name: row.name,
            productBrandId: brandId,
            slug: productSlug,
            status: "ACTIVE",
          },
        });

        await tx.productVariant.create({
          data: {
            inventory: {
              create: {
                quantity: row.stock,
              },
            },
            originalPrice: row.originalPrice,
            productId: product.id,
            salePrice: row.salePrice || row.originalPrice,
            sku: "",
            title: "Default Variant",
          },
        });
      });

      results.push({ success: true, name: row.name });
    } catch (error: any) {
      console.error(`Failed to import row ${(rawRow as any)?.name || "unknown"}:`, error);
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
