import dynamic from "next/dynamic";

export type BlockCategory =
  | "Hero"
  | "Products"
  | "Collections"
  | "Content"
  | "Social"
  | "Media"
  | "Other";

export type BlockType =
  | "HERO"
  | "HERO_MODERN"
  | "TEXT"
  | "PRODUCTS_GRID"
  | "PRODUCTS_SLIDER"
  | "COLLECTIONS_GRID"
  | "COLLECTIONS_SPOTLIGHT"
  | "COLLECTIONS_RAIL"
  | "TESTIMONIALS"
  | "CAROUSEL_1_3"
  | "CAROUSEL_1_2"
  | "CAROUSEL_FULL";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  category: BlockCategory;
  component: React.ComponentType<Record<string, unknown>>;
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
  COLLECTIONS_GRID: {
    type: "COLLECTIONS_GRID",
    label: "Collections Grid",
    category: "Collections",
    component: dynamic(
      () => import("@/components/pageblocks/CollectionsGrid/CollectionsGrid"),
    ),
    description: "A polished grid of collections with image-led cards.",
  },
  COLLECTIONS_SPOTLIGHT: {
    type: "COLLECTIONS_SPOTLIGHT",
    label: "Collections Spotlight",
    category: "Collections",
    component: dynamic(
      () =>
        import(
          "@/components/pageblocks/CollectionsSpotlight/CollectionsSpotlight"
        ),
    ),
    description: "A featured collection layout with supporting collection cards.",
  },
  COLLECTIONS_RAIL: {
    type: "COLLECTIONS_RAIL",
    label: "Collections Rail",
    category: "Collections",
    component: dynamic(
      () => import("@/components/pageblocks/CollectionsRail/CollectionsRail"),
    ),
    description: "A horizontal collection rail for quick discovery.",
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
  CAROUSEL_1_3: {
    type: "CAROUSEL_1_3",
    label: "Compact Carousel (1/3)",
    category: "Media",
    component: dynamic(
      () => import("@/components/pageblocks/Carousel/Carousel"),
    ),
    description: "Full-width carousel with 1/3 page height.",
  },
  CAROUSEL_1_2: {
    type: "CAROUSEL_1_2",
    label: "Medium Carousel (1/2)",
    category: "Media",
    component: dynamic(
      () => import("@/components/pageblocks/Carousel/Carousel"),
    ),
    description: "Full-width carousel with 1/2 page height.",
  },
  CAROUSEL_FULL: {
    type: "CAROUSEL_FULL",
    label: "Full Page Carousel",
    category: "Media",
    component: dynamic(
      () => import("@/components/pageblocks/Carousel/Carousel"),
    ),
    description: "Full-width carousel with 100vh height.",
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
    Collections: [],
    Content: [],
    Social: [],
    Media: [],
    Other: [],
  };

  Object.values(BLOCK_REGISTRY).forEach((block) => {
    groups[block.category].push(block);
  });

  return Object.entries(groups)
    .filter(([, blocks]) => blocks.length > 0)
    .map(([category, blocks]) => ({
      category,
      blocks,
    }));
};
