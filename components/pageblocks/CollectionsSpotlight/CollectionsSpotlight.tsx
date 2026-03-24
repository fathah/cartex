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

const CollectionsSpotlight = ({
  title,
  subtitle,
  alignment = "left",
  sourceType = "LATEST",
  collectionIds,
  limit = 4,
  backgroundColor,
  accentColor = "#0f766e",
  ctaLabel = "Explore collection",
  showDescription = true,
  showProductCount = true,
}: CollectionBlockProps) => {
  const { collections, loading } = useCollectionSource({
    sourceType,
    collectionIds,
    limit,
  });

  const featuredCollection = collections[0];
  const secondaryCollections = collections.slice(1);

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: backgroundColor || "#fffaf5" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <CollectionSectionHeader
          title={title}
          subtitle={subtitle}
          alignment={alignment}
        />

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
            <div className="min-h-[520px] animate-pulse rounded-[2rem] bg-slate-200/70" />
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[160px] animate-pulse rounded-[1.75rem] bg-slate-200/60"
                />
              ))}
            </div>
          </div>
        ) : collections.length === 0 ? (
          <CollectionEmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
            {featuredCollection && (
              <Link
                href={`/categories/${featuredCollection.slug}`}
                className="group relative isolate overflow-hidden rounded-[2.25rem] bg-slate-950 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.7)]"
              >
                <div className="absolute inset-0">
                  <CollectionImage
                    collection={featuredCollection}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="relative flex min-h-[520px] flex-col justify-end gap-6 p-8 md:p-10">
                  {showProductCount && (
                    <CollectionCount
                      value={featuredCollection._count?.products}
                      accentColor={accentColor}
                    />
                  )}
                  <div className="max-w-xl space-y-4">
                    <h3 className="text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-none tracking-[-0.05em]">
                      {featuredCollection.name}
                    </h3>
                    {showDescription && featuredCollection.description && (
                      <p className="max-w-lg text-sm leading-7 text-white/78 md:text-base">
                        {featuredCollection.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="inline-flex w-fit items-center rounded-full px-5 py-2.5 text-sm font-medium text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {ctaLabel}
                  </div>
                </div>
              </Link>
            )}

            <div className="space-y-5">
              {secondaryCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-3 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)]"
                >
                  <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-[1.3rem] bg-slate-100">
                      <CollectionImage
                        collection={collection}
                        className="h-full min-h-[160px] w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-between gap-4 p-2 pr-3">
                      <div className="space-y-3">
                        {showProductCount && (
                          <CollectionCount
                            value={collection._count?.products}
                            accentColor={accentColor}
                          />
                        )}
                        <div>
                          <h4 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                            {collection.name}
                          </h4>
                          {showDescription && collection.description && (
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                              {collection.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <CollectionLink
                        slug={collection.slug}
                        label={ctaLabel}
                        accentColor={accentColor}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {secondaryCollections.length === 0 && featuredCollection && (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-sm text-slate-500">
                  Add more selected collections to populate the supporting cards
                  in this spotlight layout.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionsSpotlight;
