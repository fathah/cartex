"use client";

import React from "react";
import {
  CollectionBlockProps,
  CollectionCount,
  CollectionEmptyState,
  CollectionImage,
  CollectionLink,
  CollectionSectionHeader,
  useCollectionSource,
} from "../Collections/shared";

const CollectionsRail = ({
  title,
  subtitle,
  alignment = "left",
  sourceType = "LATEST",
  collectionIds,
  limit = 8,
  backgroundColor,
  accentColor = "#ea580c",
  ctaLabel = "Shop the edit",
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
      className="overflow-hidden py-16 md:py-24"
      style={{ backgroundColor: backgroundColor || "#fff7ed" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <CollectionSectionHeader
          title={title}
          subtitle={subtitle}
          alignment={alignment}
        />

        {loading ? (
          <div className="flex gap-5 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[430px] min-w-[290px] animate-pulse rounded-[2rem] bg-slate-200/65"
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <CollectionEmptyState />
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
            {collections.map((collection) => (
              <article
                key={collection.id}
                className="group flex min-h-[430px] min-w-[290px] max-w-[320px] snap-start flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.38)] transition duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-[5/6] overflow-hidden bg-slate-100">
                  <CollectionImage
                    collection={collection}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-slate-950/60 via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  {showProductCount && (
                    <CollectionCount
                      value={collection._count?.products}
                      accentColor={accentColor}
                    />
                  )}
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
                  <div className="mt-auto">
                    <CollectionLink
                      slug={collection.slug}
                      label={ctaLabel}
                      accentColor={accentColor}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionsRail;
