"use client";

import React, { useMemo, useState } from "react";
import { Badge, Empty, Input, Modal, Tabs, Tag, Typography } from "antd";
import {
  LayoutTemplate,
  ShoppingBag,
  Layers3,
  Type,
  MessageSquareQuote,
  Images,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  BlockCategory,
  BlockDefinition,
  getGroupedBlockTypes,
} from "@/lib/pageblocks/registry";

const { Paragraph, Text, Title } = Typography;

interface BlockPickerModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (type: string) => void;
}

const categoryMeta: Record<
  BlockCategory,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    tint: string;
    label: string;
  }
> = {
  Hero: {
    icon: LayoutTemplate,
    tint: "from-sky-100 via-cyan-50 to-white",
    label: "Hero",
  },
  Products: {
    icon: ShoppingBag,
    tint: "from-emerald-100 via-lime-50 to-white",
    label: "Products",
  },
  Collections: {
    icon: Layers3,
    tint: "from-orange-100 via-amber-50 to-white",
    label: "Collections",
  },
  Content: {
    icon: Type,
    tint: "from-amber-100 via-yellow-50 to-white",
    label: "Content",
  },
  Social: {
    icon: MessageSquareQuote,
    tint: "from-fuchsia-100 via-rose-50 to-white",
    label: "Social",
  },
  Media: {
    icon: Images,
    tint: "from-indigo-100 via-blue-50 to-white",
    label: "Media",
  },
  Other: {
    icon: Sparkles,
    tint: "from-slate-200 via-slate-50 to-white",
    label: "Other",
  },
};

const blockMeta: Record<
  string,
  {
    tone: string;
    eyebrow: string;
    highlights: string[];
  }
> = {
  HERO: {
    tone: "from-sky-500/20 via-cyan-300/10 to-transparent",
    eyebrow: "Classic conversion block",
    highlights: ["Heading", "CTA", "Above the fold"],
  },
  HERO_MODERN: {
    tone: "from-sky-500/20 via-violet-300/10 to-transparent",
    eyebrow: "Split layout",
    highlights: ["Dual CTA", "Visual focus", "Modern"],
  },
  TEXT: {
    tone: "from-amber-500/15 via-orange-300/10 to-transparent",
    eyebrow: "Narrative content",
    highlights: ["Rich copy", "Editorial", "Flexible"],
  },
  PRODUCTS_GRID: {
    tone: "from-emerald-500/15 via-lime-300/10 to-transparent",
    eyebrow: "Structured commerce",
    highlights: ["Grid", "Collection driven", "Catalog"],
  },
  PRODUCTS_SLIDER: {
    tone: "from-emerald-500/15 via-teal-300/10 to-transparent",
    eyebrow: "Browseable rail",
    highlights: ["Carousel", "Featured", "Swipeable"],
  },
  COLLECTIONS_GRID: {
    tone: "from-orange-500/15 via-amber-300/10 to-transparent",
    eyebrow: "Editorial collection grid",
    highlights: ["Collections", "Image cards", "Balanced"],
  },
  COLLECTIONS_SPOTLIGHT: {
    tone: "from-orange-500/20 via-rose-300/10 to-transparent",
    eyebrow: "Hero + supporting cards",
    highlights: ["Featured", "High impact", "Curated"],
  },
  COLLECTIONS_RAIL: {
    tone: "from-orange-500/15 via-yellow-300/10 to-transparent",
    eyebrow: "Horizontal discovery",
    highlights: ["Rail", "Quick browse", "Mobile friendly"],
  },
  TESTIMONIALS: {
    tone: "from-fuchsia-500/15 via-pink-300/10 to-transparent",
    eyebrow: "Social proof",
    highlights: ["Quotes", "Trust", "Customer voices"],
  },
  CAROUSEL_1_3: {
    tone: "from-indigo-500/15 via-sky-300/10 to-transparent",
    eyebrow: "Compact motion",
    highlights: ["Carousel", "Media", "Short hero"],
  },
  CAROUSEL_1_2: {
    tone: "from-indigo-500/15 via-blue-300/10 to-transparent",
    eyebrow: "Medium stage",
    highlights: ["Carousel", "Balanced", "Showcase"],
  },
  CAROUSEL_FULL: {
    tone: "from-indigo-500/20 via-blue-300/10 to-transparent",
    eyebrow: "Immersive stage",
    highlights: ["Carousel", "Full viewport", "Campaign"],
  },
};

const BlockPickerModal: React.FC<BlockPickerModalProps> = ({
  open,
  onCancel,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const groupedBlocks = getGroupedBlockTypes();
  const query = search.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    return groupedBlocks
      .map((group) => ({
        ...group,
        blocks: group.blocks.filter((block) => {
          const haystack = [
            block.label,
            block.description,
            block.type,
            group.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(query);
        }),
      }))
      .filter((group) => group.blocks.length > 0);
  }, [groupedBlocks, query]);

  const totalBlocks = groupedBlocks.reduce(
    (count, group) => count + group.blocks.length,
    0,
  );

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1180}
      style={{ top: 24 }}
      styles={{ body: { padding: 24 } }}
      destroyOnHidden
    >
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Tag
                bordered={false}
                className="mb-4 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white"
              >
                Page Builder
              </Tag>
              <Title level={3} className="!mb-2 !text-slate-900">
                Pick a block that matches the story you want to tell
              </Title>
              <Paragraph className="!mb-0 !text-base !leading-7 !text-slate-600">
                Browse layout families, compare section styles, and jump into
                configuration with a cleaner gallery view.
              </Paragraph>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[460px]">
              <Input.Search
                allowClear
                placeholder="Search blocks, layouts, or categories"
                size="large"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="sm:col-span-2"
              />
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Text className="block text-xs uppercase tracking-[0.22em] text-slate-400">
                  Total Blocks
                </Text>
                <Text strong className="text-lg text-slate-900">
                  {totalBlocks}
                </Text>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Text className="block text-xs uppercase tracking-[0.22em] text-slate-400">
                  Matching
                </Text>
                <Text strong className="text-lg text-slate-900">
                  {filteredGroups.reduce(
                    (count, group) => count + group.blocks.length,
                    0,
                  )}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white py-16">
            <Empty description="No blocks match that search yet." />
          </div>
        ) : (
          <Tabs
            tabPosition="left"
            className="block-picker-tabs"
            items={filteredGroups.map((group) => {
              const meta = categoryMeta[group.category as BlockCategory];
              const CategoryIcon = meta.icon;

              return {
                key: group.category,
                label: (
                  <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br ${meta.tint} text-slate-700`}
                    >
                      <CategoryIcon size={18} />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-sm font-semibold text-slate-900">
                        {meta.label}
                      </div>
                      <Badge
                        count={group.blocks.length}
                        color="#0f172a"
                        className="text-xs"
                      />
                    </div>
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 gap-5 px-2 pb-2 md:grid-cols-2 xl:grid-cols-3">
                    {group.blocks.map((block) => (
                      <BlockCard
                        key={block.type}
                        block={block}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                ),
              };
            })}
          />
        )}
      </div>
    </Modal>
  );
};

const BlockCard = ({
  block,
  onSelect,
}: {
  block: BlockDefinition;
  onSelect: (type: string) => void;
}) => {
  const meta = blockMeta[block.type] || {
    tone: "from-slate-500/10 via-slate-300/10 to-transparent",
    eyebrow: block.category,
    highlights: ["Configurable", "Reusable"],
  };
  const Icon = categoryMeta[block.category].icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(block.type)}
      className="group w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white text-left shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_28px_60px_-36px_rgba(15,23,42,0.38)]"
    >
      <div
        className={`relative overflow-hidden border-b border-slate-200 bg-linear-to-br ${meta.tone} px-5 py-5`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.8),_transparent_38%)]" />
        <div className="relative mb-5 flex items-center justify-between">
          <Tag
            bordered={false}
            className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600"
          >
            {meta.eyebrow}
          </Tag>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
            <Icon size={18} />
          </div>
        </div>

        <BlockMiniPreview type={block.type} />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Text strong className="block text-base text-slate-900">
              {block.label}
            </Text>
            <Paragraph className="!mb-0 !mt-2 !text-sm !leading-6 !text-slate-600">
              {block.description || "Reusable storefront block."}
            </Paragraph>
          </div>
          <ArrowRight
            size={18}
            className="mt-1 shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-700"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {meta.highlights.map((item) => (
            <Tag
              key={item}
              bordered={false}
              className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600"
            >
              {item}
            </Tag>
          ))}
        </div>
      </div>
    </button>
  );
};

const BlockMiniPreview = ({ type }: { type: string }) => {
  if (type === "COLLECTIONS_SPOTLIGHT") {
    return (
      <div className="grid h-36 grid-cols-[1.2fr_0.8fr] gap-3">
        <div className="rounded-[1.5rem] bg-white/90 p-4 shadow-sm">
          <div className="mb-8 h-3 w-16 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded-full bg-slate-800/90" />
            <div className="h-4 w-1/2 rounded-full bg-slate-300" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.2rem] bg-white/80 p-3 shadow-sm"
            >
              <div className="mb-3 h-12 rounded-xl bg-slate-200" />
              <div className="h-3 w-2/3 rounded-full bg-slate-400" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "COLLECTIONS_RAIL" || type === "PRODUCTS_SLIDER") {
    return (
      <div className="flex h-36 gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="min-w-[120px] rounded-[1.3rem] bg-white/85 p-3 shadow-sm"
          >
            <div className="mb-3 h-16 rounded-xl bg-slate-200" />
            <div className="mb-2 h-3 w-4/5 rounded-full bg-slate-700/70" />
            <div className="h-3 w-2/3 rounded-full bg-slate-300" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "PRODUCTS_GRID" || type === "COLLECTIONS_GRID") {
    return (
      <div className="grid h-36 grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[1.2rem] bg-white/85 p-3 shadow-sm"
          >
            <div className="mb-3 h-12 rounded-xl bg-slate-200" />
            <div className="mb-2 h-3 w-3/4 rounded-full bg-slate-700/70" />
            <div className="h-3 w-1/2 rounded-full bg-slate-300" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-36 gap-3">
      <div className="rounded-[1.4rem] bg-white/90 p-4 shadow-sm">
        <div className="mb-4 h-3 w-20 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-4/5 rounded-full bg-slate-800/90" />
          <div className="h-4 w-2/3 rounded-full bg-slate-300" />
          <div className="mt-5 h-9 w-28 rounded-full bg-slate-900/90" />
        </div>
      </div>
    </div>
  );
};

export default BlockPickerModal;
