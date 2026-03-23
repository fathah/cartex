"use server";

import ProductDB, { CreateProductData } from "@/db/product";
import ConfigDB from "@/db/config";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { Prisma, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/services/zauth";

type ProductDescriptionTone = "balanced" | "luxury" | "technical" | "playful";
type ProductDescriptionLength = "short" | "medium" | "long";
type ProductDescriptionFormat = "story" | "benefits" | "paragraph";

interface GenerateProductDescriptionInput {
  name: string;
  brandName?: string | null;
  collectionNames?: string[];
  existingDescription?: string | null;
  customPrompt?: string | null;
  tone?: ProductDescriptionTone;
  length?: ProductDescriptionLength;
  format?: ProductDescriptionFormat;
}

export async function getProducts(
  page = 1,
  limit = 20,
  status?: ProductStatus,
) {
  const result = await ProductDB.list(page, limit, status);
  return JSON.parse(JSON.stringify(result));
}

export async function getDeals(page = 1, limit = 20, status?: ProductStatus) {
  const result = await ProductDB.listDeals(page, limit, status);
  return JSON.parse(JSON.stringify(result));
}

export async function getFeaturedProducts(limit = 4) {
  const result = await ProductDB.listFeatured(limit);
  return JSON.parse(JSON.stringify(result));
}

export async function getBrandProducts(
  brandId: string,
  page = 1,
  limit = 20,
  status?: ProductStatus,
) {
  const result = await ProductDB.listByBrandId(brandId, page, limit, status);
  return JSON.parse(JSON.stringify(result));
}

export async function getCollectionProducts(
  collectionId: string,
  page = 1,
  limit = 20,
  status?: ProductStatus,
) {
  const result = await ProductDB.listByCollectionId(
    collectionId,
    page,
    limit,
    status,
  );
  return JSON.parse(JSON.stringify(result));
}

export async function getProductsByIds(ids: string[]) {
  const result = await ProductDB.listByIds(ids);
  return JSON.parse(JSON.stringify(result));
}

export async function getProduct(id: string) {
  const result = await ProductDB.findById(id);
  return JSON.parse(JSON.stringify(result));
}

export async function getProductBySlug(slug: string) {
  const result = await ProductDB.findBySlug(slug);
  return JSON.parse(JSON.stringify(result));
}

export async function createProduct(data: CreateProductData) {
  await requireAdminAuth();
  const product = await ProductDB.create(data);
  revalidatePath("/admin/products");
  return product; // Return product to redirect client-side or we can redirect here
}

export async function updateProduct(
  id: string,
  data: Prisma.ProductUpdateInput,
) {
  await requireAdminAuth();
  const product = await ProductDB.update(id, data);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return product;
}

export async function deleteProduct(id: string) {
  await requireAdminAuth();
  await ProductDB.delete(id);
  revalidatePath("/admin/products");
}

export async function addOption(
  productId: string,
  name: string,
  values: string[],
) {
  await requireAdminAuth();
  await ProductDB.addOption(productId, name, values);
  await ProductDB.generateVariants(productId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateOption(
  productId: string,
  optionId: string,
  name: string,
  values: string[],
) {
  await requireAdminAuth();
  await ProductDB.updateOption(optionId, name, values);
  await ProductDB.syncVariants(productId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteOption(productId: string, optionId: string) {
  await requireAdminAuth();
  await ProductDB.deleteOption(optionId);
  await ProductDB.syncVariants(productId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function generateVariants(productId: string) {
  await requireAdminAuth();
  await ProductDB.generateVariants(productId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariant(
  variantId: string,
  data: {
    originalPrice: number;
    salePrice: number;
    sku?: string;
    inventory: number;
  },
) {
  await requireAdminAuth();
  const variant = await ProductDB.updateVariant(variantId, data);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${variant.productId}`);
  return variant;
}

export async function deleteVariant(variantId: string) {
  await requireAdminAuth();
  const variant = await ProductDB.deleteVariant(variantId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${variant.productId}`);
  return variant;
}

export async function addMedia(
  productId: string,
  url: string,
  type: "IMAGE" | "VIDEO" = "IMAGE",
) {
  await requireAdminAuth();
  const media = await ProductDB.addMedia(productId, url, type);
  revalidatePath(`/admin/products/${productId}`);
  return media;
}

export async function linkMedia(productId: string, mediaId: string) {
  await requireAdminAuth();
  const mediaLink = await ProductDB.linkMedia(productId, mediaId);
  revalidatePath(`/admin/products/${productId}`);
  return mediaLink;
}

export async function removeMedia(mediaId: string, productId: string) {
  await requireAdminAuth();
  await ProductDB.removeMedia(mediaId, productId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function checkSlugAvailability(slug: string, excludeId?: string) {
  const product = await ProductDB.findBySlug(slug);
  if (product && excludeId && product.id === excludeId) {
    return true; // Still available if it's the same product
  }
  return !product;
}

export async function generateProductDescription(
  input: GenerateProductDescriptionInput,
) {
  await requireAdminAuth();

  const name = input.name?.trim();
  if (!name) {
    throw new Error("Add a product title before generating a description.");
  }

  const { openrouterApiKey, openrouterModel } =
    await ConfigDB.getAIAutomationSettings();

  if (!openrouterApiKey || !openrouterModel) {
    throw new Error(
      "OpenRouter is not configured. Add your API key and model in Admin Settings -> AI & Automation.",
    );
  }

  const openrouter = createOpenRouter({ apiKey: openrouterApiKey });
  const { text } = await generateText({
    model: openrouter(openrouterModel),
    system: [
      "You are an expert ecommerce copywriter for a premium storefront.",
      "Write persuasive, credible product descriptions that feel polished and human.",
      "Use only the details provided. Never invent materials, measurements, certifications, warranties, discounts, or technical claims.",
      "Return as  markdown",
    ].join(" "),
    prompt: buildProductDescriptionPrompt({
      ...input,
      name,
      tone: input.tone ?? "balanced",
      length: input.length ?? "medium",
      format: input.format ?? "story",
    }),
  });

  const description = text.trim();
  if (!description) {
    throw new Error(
      "The model returned an empty description. Please try again.",
    );
  }

  return { description };
}

function buildProductDescriptionPrompt(
  input: Required<
    Pick<GenerateProductDescriptionInput, "name" | "tone" | "length" | "format">
  > &
    Omit<
      GenerateProductDescriptionInput,
      "name" | "tone" | "length" | "format"
    >,
) {
  const toneGuide: Record<ProductDescriptionTone, string> = {
    balanced: "Keep the voice polished, modern, and broadly appealing.",
    luxury:
      "Make it feel refined, elevated, and aspirational without sounding exaggerated.",
    technical: "Lead with function, clarity, and product usefulness.",
    playful: "Keep it lively, warm, and stylish while still sounding credible.",
  };

  const lengthGuide: Record<ProductDescriptionLength, string> = {
    short: "Keep it concise: around 70 to 110 words.",
    medium: "Aim for a balanced description: around 120 to 180 words.",
    long: "Create a fuller description: around 180 to 260 words.",
  };

  const formatGuide: Record<ProductDescriptionFormat, string> = {
    story: "Use a short opening paragraph followed by compact benefit bullets.",
    benefits: "Write a benefit-led description with crisp bullet points.",
    paragraph: "Write in clean paragraphs without bullets.",
  };

  return [
    `Product title: ${input.name}`,
    `Brand: ${input.brandName?.trim() || "Not provided"}`,
    `Collections: ${
      input.collectionNames && input.collectionNames.length > 0
        ? input.collectionNames.join(", ")
        : "Not provided"
    }`,
    `Existing description: ${input.existingDescription?.trim() || "None"}`,
    `Custom instructions: ${input.customPrompt?.trim() || "None"}`,
    `Tone direction: ${toneGuide[input.tone]}`,
    `Length direction: ${lengthGuide[input.length]}`,
    `Structure direction: ${formatGuide[input.format]}`,
    "Write copy that feels ready to paste into a product description field.",
    "Focus on value, desirability, and shopper clarity.",
    "If details are missing, keep the wording specific in feel but conservative in factual claims.",
  ].join("\n");
}
