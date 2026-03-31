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

const tilePalettes = [
  {
    background: "#d5f1e8",
    ring: "#8bd5bf",
    text: "#17352d",
  },
  {
    background: "#dbe2ff",
    ring: "#a8b7ef",
    text: "#1f2952",
  },
  {
    background: "#ffd9d4",
    ring: "#f6b2ab",
    text: "#5d2823",
  },
  {
    background: "#f1e8a7",
    ring: "#d9cd6f",
    text: "#49401e",
  },
  {
    background: "#efc8dd",
    ring: "#d594b9",
    text: "#532842",
  },
  {
    background: "#d6f1d8",
    ring: "#9ed4a3",
    text: "#214327",
  },
] as const;

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
      style={{ backgroundColor: backgroundColor || "#fdfdf9" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <CollectionSectionHeader
          title={title}
          subtitle={subtitle}
          alignment={alignment}
        />

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: Math.min(limit, 6) || 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[2rem] bg-slate-200/65"
              >
                <div className="aspect-square animate-pulse bg-slate-200/70" />
                <div className="space-y-3 px-5 pb-5">
                  <div className="mx-auto mt-4 h-5 w-2/3 animate-pulse rounded-full bg-slate-200/70" />
                  <div className="mx-auto h-4 w-1/2 animate-pulse rounded-full bg-slate-200/60" />
                </div>
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <CollectionEmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {collections.map((collection, index) => {
              const palette = tilePalettes[index % tilePalettes.length];

              return (
                <Link
                  key={collection.id}
                  href={`/categories/${collection.slug}`}
                  className="group block"
                >
                  <article
                    className="relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[2rem] p-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.34)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-38px_rgba(15,23,42,0.4)]"
                    style={{ backgroundColor: palette.background, color: palette.text }}
                  >
                    <div
                      className="absolute inset-x-5 top-4 h-px opacity-60"
                      style={{ backgroundColor: palette.ring }}
                    />
                    <div className="relative aspect-square overflow-hidden rounded-[1.5rem]">
                      <div
                        className="absolute inset-0 rounded-[1.5rem] opacity-55"
                        style={{
                          background:
                            "radial-gradient(circle at top, rgba(255,255,255,0.58), transparent 56%)",
                        }}
                      />
                      <div
                        className="absolute inset-[10%] rounded-full blur-2xl"
                        style={{ backgroundColor: `${palette.ring}80` }}
                      />
                      <CollectionImage
                        collection={collection}
                        className="relative h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="relative mt-4 flex flex-1 flex-col items-center text-center">
                      <h3 className="text-lg font-semibold tracking-[-0.03em]">
                        {collection.name}
                      </h3>
                      {showDescription && collection.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-5 opacity-80">
                          {collection.description}
                        </p>
                      ) : null}
                      {showProductCount ? (
                        <div className="mt-3">
                          <CollectionCount
                            value={collection._count?.products}
                            accentColor={accentColor || palette.text}
                          />
                        </div>
                      ) : null}
                      <span className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] opacity-0 transition duration-300 group-hover:opacity-100">
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

export default CollectionsGrid;
