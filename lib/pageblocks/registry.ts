import dynamic from "next/dynamic";

export type BlockCategory =
  | "Hero"
  | "Products"
  | "Content"
  | "Social"
  | "Other";

export type BlockType =
  | "HERO"
  | "HERO_MODERN"
  | "TEXT"
  | "PRODUCTS_GRID"
  | "PRODUCTS_SLIDER"
  | "TESTIMONIALS";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  category: BlockCategory;
  component: React.ComponentType<any>;
  description?: string;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  HERO: {
    type: "HERO",
    label: "Hero Standard (V1)",
    category: "Hero",
    component: dynamic(() => import("@/components/pageblocks/Hero/Hero")),
    description: "A large header section with title, subtitle and CTA.",
  },
  HERO_MODERN: {
    type: "HERO_MODERN",
    label: "Modern Creative Hero",
    category: "Hero",
    component: dynamic(() => import("@/components/pageblocks/Hero/HeroModern")),
    description: "A modern split-layout hero with illustration and two CTAs.",
  },
  TEXT: {
    type: "TEXT",
    label: "Rich Text",
    category: "Content",
    component: dynamic(() => import("@/components/pageblocks/Text/Text")),
    description: "A simple section for text content.",
  },
  PRODUCTS_GRID: {
    type: "PRODUCTS_GRID",
    label: "Basic Grid",
    category: "Products",
    component: dynamic(
      () => import("@/components/pageblocks/ProductsGrid/ProductsGrid"),
    ),
    description: "A grid of products from a collection.",
  },
  PRODUCTS_SLIDER: {
    type: "PRODUCTS_SLIDER",
    label: "Basic Slider",
    category: "Products",
    component: dynamic(
      () => import("@/components/pageblocks/ProductsSlider/ProductsSlider"),
    ),
    description: "A sliding carousel of products.",
  },
  TESTIMONIALS: {
    type: "TESTIMONIALS",
    label: "Testimonials List",
    category: "Social",
    component: dynamic(
      () => import("@/components/pageblocks/Testimonials/Testimonials"),
    ),
    description: "A section to display customer testimonials.",
  },
};

export const getBlockDefinition = (type: string) => {
  return BLOCK_REGISTRY[type as BlockType];
};

export const getAllBlockTypes = () => {
  return Object.values(BLOCK_REGISTRY);
};

export const getGroupedBlockTypes = () => {
  const groups: Record<BlockCategory, BlockDefinition[]> = {
    Hero: [],
    Products: [],
    Content: [],
    Social: [],
    Other: [],
  };

  Object.values(BLOCK_REGISTRY).forEach((block) => {
    groups[block.category].push(block);
  });

  return Object.entries(groups)
    .filter(([_, blocks]) => blocks.length > 0)
    .map(([category, blocks]) => ({
      category,
      blocks,
    }));
};
