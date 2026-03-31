"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { getCollections } from "@/actions/collection";
import { getMediaUrl } from "@/utils/media_url";

export type CollectionSourceType = "LATEST" | "CUSTOM";

export interface CollectionRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  textColor?: string | null;
  imageId?: string | null;
  mediaId?: string | null;
  featureImageId?: string | null;
  image?: {
    url?: string | null;
  } | null;
  featureImage?: {
    url?: string | null;
  } | null;
  _count?: {
    products?: number;
  };
}

export interface CollectionBlockProps {
  title?: string;
  subtitle?: string;
  alignment?: "left" | "center" | "right";
  sourceType?: CollectionSourceType;
  collectionIds?: string[];
  limit?: number;
  backgroundColor?: string;
  accentColor?: string;
  ctaLabel?: string;
  showDescription?: boolean;
  showProductCount?: boolean;
}

const alignmentClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const contentAlignmentClasses = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

export const resolveCollectionImage = (collection: CollectionRecord) => {
  const imageRef =
    collection.image?.url || collection.mediaId || collection.imageId;

  return imageRef ? getMediaUrl(imageRef) : null;
};

export const resolveCollectionFeatureImage = (collection: CollectionRecord) => {
  const imageRef = collection.featureImage?.url || collection.featureImageId;

  return imageRef ? getMediaUrl(imageRef) : null;
};

export const useCollectionSource = ({
  sourceType = "LATEST",
  collectionIds,
  limit = 6,
}: Pick<CollectionBlockProps, "sourceType" | "collectionIds" | "limit">) => {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedIdsKey = collectionIds?.join("|") ?? "";

  useEffect(() => {
    let active = true;

    const fetchCollections = async () => {
      setLoading(true);
      try {
        const allCollections = (await getCollections()) as CollectionRecord[];
        const selectedIds = selectedIdsKey ? selectedIdsKey.split("|") : [];

        if (!active) {
          return;
        }

        if (sourceType === "CUSTOM" && selectedIds.length) {
          const byId = new Map(allCollections.map((item) => [item.id, item]));
          const selectedCollections = selectedIds
            .map((id) => byId.get(id))
            .filter(Boolean) as CollectionRecord[];

          setCollections(selectedCollections.slice(0, limit));
          return;
        }

        setCollections(allCollections.slice(0, limit));
      } catch (error) {
        console.error("Failed to fetch collections:", error);
        if (active) {
          setCollections([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCollections();

    return () => {
      active = false;
    };
  }, [sourceType, selectedIdsKey, limit]);

  return { collections, loading };
};

export const CollectionSectionHeader = ({
  title,
  subtitle,
  alignment = "left",
}: Pick<CollectionBlockProps, "title" | "subtitle" | "alignment">) => {
  if (!title && !subtitle) {
    return null;
  }

  return (
    <div className={`mb-10 ${alignmentClasses[alignment]}`}>
      {title && (
        <h2 className="text-[clamp(2.2rem,4vw,4rem)] font-semibold tracking-[-0.05em] text-slate-800">
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className={`mt-3 max-w-2xl text-[15px] leading-7 text-slate-500 ${contentAlignmentClasses[alignment]}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export const CollectionCount = ({
  value,
  accentColor,
}: {
  value?: number;
  accentColor?: string;
}) => {
  if (typeof value !== "number") {
    return null;
  }

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
      style={{
        backgroundColor: accentColor ? `${accentColor}18` : "#0f172a12",
        color: accentColor || "#0f172a",
      }}
    >
      {value} {value === 1 ? "product" : "products"}
    </span>
  );
};

export const CollectionImage = ({
  collection,
  className,
}: {
  collection: CollectionRecord;
  className?: string;
}) => {
  const imageUrl = resolveCollectionImage(collection);

  if (imageUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={imageUrl}
        alt={collection.name}
        className={className || "h-full w-full object-cover"}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_transparent_58%),linear-gradient(135deg,_#f8fafc,_#e2e8f0)] text-slate-400">
      <Layers3 size={44} strokeWidth={1.25} />
    </div>
  );
};

export const CollectionLink = ({
  slug,
  label,
  accentColor,
  className,
}: {
  slug: string;
  label: string;
  accentColor?: string;
  className?: string;
}) => {
  return (
    <Link
      href={`/categories/${slug}`}
      className={`inline-flex items-center gap-2 text-sm font-medium transition-transform duration-300 hover:translate-x-1 ${className || ""}`}
      style={{ color: accentColor || "#0f172a" }}
    >
      <span>{label}</span>
      <ArrowUpRight size={16} />
    </Link>
  );
};

export const CollectionEmptyState = () => {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300/80 bg-white/70 px-6 py-16 text-center text-slate-500">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/5 text-slate-400">
        <Layers3 size={24} />
      </div>
      <p className="text-base font-medium text-slate-700">
        No collections available yet
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Add a few collections to show this section on the storefront.
      </p>
    </div>
  );
};
