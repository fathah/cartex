"use server";

import prisma from "@/db/prisma";
import { requireAdminAuth } from "@/services/zauth";

export async function getProductsForExport() {
  await requireAdminAuth();

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      brand: true,
      collections: true,
      variants: {
        include: {
          inventory: true,
        },
      },
      options: {
        include: {
          values: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format data for export
  const exportData = products.map((product) => {
    // Basic product data
    const row: any = {
      ID: product.id,
      Name: product.name,
      Description: product.description || "",
      Slug: product.slug,
      Status: product.status,
      Brand: product.brand?.name || "No Brand",
      Collections: product.collections.map((c) => c.name).join(", "),
      "Featured?": product.isFeatured ? "Yes" : "No",
      "Created At": product.createdAt.toISOString(),
      "Is Options Dependent": product.options.length > 0 ? "Yes" : "No",
    };

    // Include details of the first variant (usually the default or primary one)
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      row["Default Variant SKU"] = defaultVariant.sku || "";
      row["Original Price"] = Number(defaultVariant.originalPrice) || 0;
      row["Sale Price"] = Number(defaultVariant.salePrice) || 0;
      row["Inventory Quantity"] = defaultVariant.inventory?.quantity || 0;
      row["Total Variants"] = product.variants.length;
    } else {
      row["Default Variant SKU"] = "";
      row["Original Price"] = 0;
      row["Sale Price"] = 0;
      row["Inventory Quantity"] = 0;
      row["Total Variants"] = 0;
    }

    return row;
  });

  return exportData;
}
