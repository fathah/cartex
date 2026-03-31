"use client";

import React from "react";
import Link from "next/link";
import {
  CollectionBlockProps,
  CollectionEmptyState,
  CollectionImage,
  CollectionSectionHeader,
  resolveCollectionFeatureImage,
  useCollectionSource,
} from "../Collections/shared";

const spotlightPalettes = [
  { background: "#f1f1f0", eyebrow: "#3f3f46", button: "#3f3f46" },
  { background: "#cfeeff", eyebrow: "#0b6fae", button: "#0b6fae" },
  { background: "#fff4a8", eyebrow: "#caa100", button: "#caa100" },
  { background: "#f6e7e2", eyebrow: "#b58825", button: "#b58825" },
  { background: "#dff4e7", eyebrow: "#0ca44c", button: "#0ca44c" },
  { background: "#ffe5e7", eyebrow: "#c2363f", button: "#cf4a53" },
] as const;

const layoutClasses = [
  "md:col-span-6 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-6 md:row-span-2",
] as const;

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
    limit: Math.max(limit, 6),
  });

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: backgroundColor || "#fdfcf8" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <CollectionSectionHeader
          title={title}
          subtitle={subtitle}
          alignment={alignment}
        />

        {loading ? (
          <div className="grid auto-rows-[180px] gap-5 md:grid-cols-12">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse rounded-[2rem] bg-slate-200/65 ${layoutClasses[index]}`}
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <CollectionEmptyState />
        ) : (
          <div className="grid auto-rows-[180px] gap-5 md:grid-cols-12">
            {collections.slice(0, 6).map((collection, index) => {
              const palette = spotlightPalettes[index % spotlightPalettes.length];
              const isWide = index === 0 || index === 5;
              const panelBackground = collection.color || backgroundColor || palette.background;
              const featureImageUrl = resolveCollectionFeatureImage(collection);
              const textTone = collection.textColor || "#64748b";
              const accentTone = accentColor || collection.textColor || palette.eyebrow;
              const buttonTone = accentColor || collection.textColor || palette.button;

              return (
                <Link
                  key={collection.id}
                  href={`/categories/${collection.slug}`}
                  className={`group relative isolate overflow-hidden rounded-[2rem] p-5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.24)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_75px_-44px_rgba(15,23,42,0.3)] md:p-6 ${layoutClasses[index]}`}
                  style={{ backgroundColor: panelBackground }}
                >
                  <div className="relative z-10 flex h-full max-w-[58%] flex-col">
                    <span
                      className="text-sm font-medium tracking-[-0.02em] md:text-[18px]"
                      style={{ color: accentTone }}
                    >
                      {showProductCount && typeof collection._count?.products === "number"
                        ? `${collection._count.products} ${collection._count.products === 1 ? "product" : "products"}`
                        : subtitle || "Curated collection"}
                    </span>
                    <h3
                      className="mt-3 text-[clamp(2rem,3vw,4rem)] font-semibold uppercase leading-[0.92] tracking-[-0.06em]"
                      style={{ color: textTone }}
                    >
                      {collection.name}
                    </h3>
                    {showDescription && collection.description ? (
                      <p className="mt-3 line-clamp-3 max-w-md text-sm leading-6 text-slate-600/90 md:text-base">
                        {collection.description}
                      </p>
                    ) : null}
                    <div className="mt-auto pt-6">
                      <span
                        className="inline-flex items-center rounded-xl px-5 py-3 text-sm font-medium uppercase tracking-[0.12em] text-white transition duration-300 group-hover:translate-x-1"
                        style={{ backgroundColor: buttonTone }}
                      >
                        {ctaLabel}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 right-0 transition duration-500 group-hover:scale-[1.03] ${isWide ? "h-[78%] w-[58%]" : "h-[62%] w-[70%]"}`}
                  >
                    {featureImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={featureImageUrl}
                        alt={collection.name}
                        className="h-full w-full object-contain object-bottom-right drop-shadow-[0_26px_30px_rgba(15,23,42,0.16)]"
                      />
                    ) : (
                      <CollectionImage
                        collection={collection}
                        className="h-full w-full object-contain object-bottom-right drop-shadow-[0_26px_30px_rgba(15,23,42,0.16)]"
                      />
                    )}
                  </div>
                </Link>
              );
            })}

            {collections.length < 6
              ? Array.from({ length: 6 - collections.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className={`hidden rounded-[2rem] border border-dashed border-slate-300/80 bg-white/60 md:block ${layoutClasses[collections.length + index]}`}
                  />
                ))
              : null}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionsSpotlight;
