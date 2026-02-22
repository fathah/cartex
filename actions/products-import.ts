"use server";

import { requireAdminAuth } from "@/services/zauth";
import prisma from "@/db/prisma";
import ProductDB from "@/db/product";
import { revalidatePath } from "next/cache";

export async function importProductBatch(rows: any[]) {
  await requireAdminAuth();

  const results = [];

  // We will process sequentially within the batch to avoid race conditions
  // on creating duplicate categories/brands if multiple rows share the same new ones.
  for (const row of rows) {
    try {
      let categoryId = null;
      let brandId = null;

      // 1. Resolve Category
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
          // Auto-generate a slug
          const baseSlug = row.category
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          let slug = baseSlug;
          let counter = 1;
          while (await prisma.collection.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
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

      // 2. Resolve Brand
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
            data: {
              name: row.brand,
            },
          });
        }
        brandId = brand.id;
      }

      // 3. Resolve Product Slug
      const baseProductSlug = row.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      let productSlug = baseProductSlug;
      let pCounter = 1;
      while (
        await prisma.product.findUnique({ where: { slug: productSlug } })
      ) {
        productSlug = `${baseProductSlug}-${pCounter}`;
        pCounter++;
      }

      // 4. Create Product with default Variant
      const status = "ACTIVE"; // Imported products default to active

      const product = await prisma.$transaction(async (tx) => {
        const p = await tx.product.create({
          data: {
            name: row.name,
            slug: productSlug,
            status: status as any,
            productBrandId: brandId,
            ...(categoryId && {
              collections: {
                connect: { id: categoryId },
              },
            }),
          },
        });

        // Create default variant with stock
        const variant = await tx.productVariant.create({
          data: {
            productId: p.id,
            title: "Default Variant",
            originalPrice: row.originalPrice || 0,
            salePrice: row.salePrice || 0,
            sku: "",
            inventory: {
              create: {
                quantity: row.stock || 0,
              },
            },
          },
        });

        return p;
      });

      results.push({ success: true, name: row.name });
    } catch (err: any) {
      console.error(`Failed to import row ${row.name}:`, err);
      results.push({ success: false, name: row.name, error: err.message });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/brands");

  return results;
}
