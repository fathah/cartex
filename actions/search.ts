"use server";

import prisma from "@/db/prisma";
import { resolveCurrentMarket } from "@/lib/market";
import { applyMarketPricingToProduct } from "@/lib/product-market";
import {
  consumeRateLimit,
  RateLimitError,
  getRequestIp,
} from "@/services/rate-limit";
import { z } from "zod";

const searchProductsSchema = z.object({
  query: z.string().trim().max(120).default(""),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

const recommendationSchema = z.object({
  query: z.string().trim().max(80).optional(),
});

const EMPTY_PRODUCTS_RESULT = {
  products: [] as any[],
};

const EMPTY_RECOMMENDATIONS_RESULT = {
  suggestions: [] as Array<{ type: string; label: string; href: string }>,
  popularCategories: [] as string[],
};

function mapSearchProducts(products: any[]) {
  return products
    .map((product) => applyMarketPricingToProduct(product))
    .filter((product: any) => product && !product.unavailableInMarket);
}

async function consumeSearchRateLimit(
  action: "catalog_search" | "catalog_search_recommendations",
) {
  const identifier = await getRequestIp();

  try {
    await consumeRateLimit({
      action,
      blockMs: 60 * 1000,
      identifier,
      limit: action === "catalog_search" ? 60 : 120,
      windowMs: 60 * 1000,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return false;
    }

    throw error;
  }

  return true;
}

export async function searchProducts(query: string, limit: number = 24) {
  const parsed = searchProductsSchema.safeParse({ query, limit });
  if (!parsed.success) {
    return EMPTY_PRODUCTS_RESULT;
  }

  const allowed = await consumeSearchRateLimit("catalog_search");
  if (!allowed) {
    return EMPTY_PRODUCTS_RESULT;
  }

  const market = await resolveCurrentMarket();
  const q = parsed.data.query;
  const take = parsed.data.limit;

  if (!q) {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
      },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        variants: {
          orderBy: { createdAt: "asc" },
          ...(market?.id ? {} : { take: 1 }),
          include: {
            inventory: true,
            selectedOptions: true,
            ...(market?.id
              ? {
                  variantMarkets: {
                    where: { marketId: market.id },
                    take: 1,
                    include: { market: true },
                  },
                }
              : {}),
          },
        },
        mediaProducts: {
          take: 1,
          include: { media: true },
        },
        collections: {
          take: 1,
        },
      },
    });

    return {
      products: mapSearchProducts(products),
    };
  }

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      variants: {
        orderBy: { createdAt: "asc" },
        ...(market?.id ? {} : { take: 1 }),
        include: {
          inventory: true,
          selectedOptions: true,
          ...(market?.id
            ? {
                variantMarkets: {
                  where: { marketId: market.id },
                  take: 1,
                  include: { market: true },
                },
              }
            : {}),
        },
      },
      mediaProducts: {
        take: 1,
        include: { media: true },
      },
      collections: {
        take: 1,
      },
    },
  });

  return {
    products: mapSearchProducts(products),
  };
}

export async function getSearchRecommendations(query?: string) {
  const parsed = recommendationSchema.safeParse({ query });
  if (!parsed.success) {
    return EMPTY_RECOMMENDATIONS_RESULT;
  }

  const allowed = await consumeSearchRateLimit("catalog_search_recommendations");
  if (!allowed) {
    return EMPTY_RECOMMENDATIONS_RESULT;
  }

  const q = parsed.data.query || "";

  if (q.length >= 2) {
    const [products, collections] = await Promise.all([
      prisma.product.findMany({
        where: {
          deletedAt: null,
          status: "ACTIVE",
          name: { contains: q, mode: "insensitive" },
        },
        take: 6,
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.collection.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      suggestions: [
        ...products.map((p) => ({
          type: "product",
          label: p.name,
          href: `/product/${p.slug}`,
        })),
        ...collections.map((c) => ({
          type: "collection",
          label: c.name,
          href: `/categories/${c.slug}`,
        })),
      ],
    };
  }

  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      take: 6,
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.product.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { name: true, slug: true },
    }),
  ]);

  return {
    suggestions: [
      ...collections.map((c) => ({
        type: "collection",
        label: c.name,
        href: `/categories/${c.slug}`,
      })),
      ...products.map((p) => ({
        type: "product",
        label: p.name,
        href: `/product/${p.slug}`,
      })),
    ],
    popularCategories: collections.map((c) => c.name),
  };
}
