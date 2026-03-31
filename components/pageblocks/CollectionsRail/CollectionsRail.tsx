"use client";

import React from "react";
import Link from "next/link";
import {
  CollectionBlockProps,
  CollectionCount,
  CollectionEmptyState,
  CollectionImage,
  CollectionSectionHeader,
  useCollectionSource,
} from "../Collections/shared";

const railPalettes = [
  "#f5d4e6",
  "#e7e7ff",
  "#dff5ec",
  "#fde5bf",
  "#d7efff",
  "#f3dfd9",
] as const;

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
      style={{ backgroundColor: backgroundColor || "#fcfcfb" }}
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
                className="min-w-[168px] max-w-[168px]"
              >
                <div className="aspect-square animate-pulse rounded-full bg-slate-200/65" />
                <div className="mx-auto mt-4 h-4 w-2/3 animate-pulse rounded-full bg-slate-200/65" />
                <div className="mx-auto mt-2 h-3 w-1/2 animate-pulse rounded-full bg-slate-200/55" />
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <CollectionEmptyState />
        ) : (
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-4 pt-1 snap-x snap-mandatory no-scrollbar md:gap-5">
            {collections.map((collection, index) => {
              const circleTone = railPalettes[index % railPalettes.length];

              return (
                <Link
                  key={collection.id}
                  href={`/categories/${collection.slug}`}
                  className="group min-w-[150px] max-w-[150px] shrink-0 snap-start text-center sm:min-w-[172px] sm:max-w-[172px] md:min-w-[196px] md:max-w-[196px]"
                >
                  <article className="flex flex-col items-center">
                    <div
                      className="relative aspect-square w-full overflow-hidden rounded-full transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_26px_55px_-42px_rgba(15,23,42,0.38)]"
                      style={{ backgroundColor: circleTone }}
                    >
                      <div className="absolute inset-[8%] rounded-full bg-white/30 blur-2xl" />
                      <CollectionImage
                        collection={collection}
                        className="relative h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 w-full space-y-1 px-2">
                      <h3 className="line-clamp-2 text-[15px] font-semibold tracking-[-0.03em] text-slate-800 sm:text-lg">
                        {collection.name}
                      </h3>
                      {showDescription && collection.description ? (
                        <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                          {collection.description}
                        </p>
                      ) : null}
                      {showProductCount ? (
                        <div className="flex justify-center pt-2">
                          <CollectionCount
                            value={collection._count?.products}
                            accentColor={accentColor}
                          />
                        </div>
                      ) : null}
                      <span
                        className="block pt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 transition duration-300 group-hover:tracking-[0.28em]"
                        style={{ color: accentColor || "#64748b" }}
                      >
                        {ctaLabel}
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionsRail;
