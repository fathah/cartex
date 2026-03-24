"use client";

import React from "react";
import Link from "next/link";
import {
  CollectionBlockProps,
  CollectionCount,
  CollectionEmptyState,
  CollectionImage,
  CollectionLink,
  CollectionSectionHeader,
  useCollectionSource,
} from "../Collections/shared";

const CollectionsGrid = ({
  title,
  subtitle,
  alignment = "left",
  sourceType = "LATEST",
  collectionIds,
  limit = 6,
  backgroundColor,
  accentColor = "#7c3aed",
  ctaLabel = "View collection",
  showDescription = true,
  showProductCount = true,
}: CollectionBlockProps) => {
  const { collections, loading } = useCollectionSource({
    sourceType,
    collectionIds,
    limit,
  });

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: backgroundColor || "#f8fafc" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <CollectionSectionHeader
          title={title}
          subtitle={subtitle}
          alignment={alignment}
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: Math.min(limit, 6) || 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)]"
              >
                <div className="aspect-[4/5] animate-pulse bg-slate-200/70" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200/70" />
                  <div className="h-8 w-2/3 animate-pulse rounded-full bg-slate-200/70" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-slate-200/60" />
                </div>
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <CollectionEmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <article
                key={collection.id}
                className="group overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] transition duration-500 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)]"
              >
                <Link
                  href={`/categories/${collection.slug}`}
                  className="block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                    <CollectionImage
                      collection={collection}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                    {showProductCount && (
                      <div className="absolute left-5 top-5">
                        <CollectionCount
                          value={collection._count?.products}
                          accentColor={accentColor}
                        />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="space-y-4 p-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                      {collection.name}
                    </h3>
                    {showDescription && collection.description && (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <CollectionLink
                    slug={collection.slug}
                    label={ctaLabel}
                    accentColor={accentColor}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionsGrid;
