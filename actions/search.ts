"use server";

import prisma from "@/db/prisma";

export async function searchProducts(query: string, limit: number = 24) {
  const q = query?.trim();
  if (!q) {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        variants: {
          take: 1,
          include: { inventory: true },
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
    return { products };
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
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      variants: {
        take: 1,
        include: { inventory: true },
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

  return { products };
}

export async function getSearchRecommendations(query?: string) {
  const q = query?.trim() || "";

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
          href: `/category/${c.slug}`,
        })),
      ],
    };
  }

  const [collections, products] = await Promise.all([
    prisma.collection.findMany({
      take: 6,
      orderBy: { name: "asc" },
      select: { name: true, slug: true, _count: { select: { products: true } } },
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
        href: `/category/${c.slug}`,
      })),
      ...products.map((p) => ({
        type: "product",
        label: p.name,
        href: `/product/${p.slug}`,
      })),
    ],
  };
}
