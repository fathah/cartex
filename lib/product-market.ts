type PriceValue = string | number | null | undefined;

function toNumber(value: PriceValue) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function serializeVariantMarket(variantMarket: any) {
  if (!variantMarket) return null;

  return {
    ...variantMarket,
    salePrice: toNumber(variantMarket.salePrice) ?? 0,
    compareAtPrice: toNumber(variantMarket.compareAtPrice),
    costPrice: toNumber(variantMarket.costPrice),
    inventoryQuantity: toNumber(variantMarket.inventoryQuantity) ?? 0,
    reservedQuantity: toNumber(variantMarket.reservedQuantity) ?? 0,
  };
}

function serializeLegacyVariant(variant: any) {
  return {
    ...variant,
    salePrice: toNumber(variant.salePrice) ?? 0,
    compareAtPrice: toNumber(variant.compareAtPrice),
    costPrice: toNumber(variant.costPrice),
  };
}

export function applyMarketPricingToVariant(variant: any) {
  const normalizedVariant = serializeLegacyVariant(variant);
  const marketVariant = serializeVariantMarket(
    normalizedVariant.marketVariant ||
      normalizedVariant.variantMarkets?.[0] ||
      null,
  );
  const effectiveSalePrice =
    marketVariant?.salePrice ?? normalizedVariant.salePrice;
  const effectiveCompareAtPrice =
    marketVariant?.compareAtPrice ?? normalizedVariant.compareAtPrice;
  const effectiveCostPrice =
    marketVariant?.costPrice ?? normalizedVariant.costPrice;
  const effectiveInventoryQuantity =
    marketVariant?.inventoryQuantity ??
    normalizedVariant.inventory?.quantity ??
    0;
  const effectiveReservedQuantity =
    marketVariant?.reservedQuantity ??
    normalizedVariant.inventory?.reserved ??
    0;
  const hasAnyMarketPricing =
    normalizedVariant._count?.variantMarkets > 0 ||
    (normalizedVariant.variantMarkets || []).length > 0;
  const isAvailableInMarket = marketVariant
    ? marketVariant.isPublished !== false && marketVariant.isAvailable !== false
    : !hasAnyMarketPricing;

  return {
    ...normalizedVariant,
    marketVariant,
    variantMarkets: normalizedVariant.variantMarkets
      ? normalizedVariant.variantMarkets.map(serializeVariantMarket)
      : undefined,
    effectiveSalePrice,
    effectiveCompareAtPrice,
    effectiveCostPrice,
    effectiveInventoryQuantity,
    effectiveReservedQuantity,
    isAvailableInMarket,
  };
}

function pickDefaultVariant(variants: any[]) {
  if (!variants.length) return null;

  return (
    variants.find((variant) => variant.title === "Default Variant") ||
    variants.find(
      (variant) =>
        Array.isArray(variant.selectedOptions) && variant.selectedOptions.length === 0,
    ) ||
    variants[0]
  );
}

export function applyMarketPricingToProduct(product: any) {
  const normalizedVariants = (product.variants || []).map(applyMarketPricingToVariant);
  const variants = normalizedVariants.filter(
    (variant: any) => variant.isAvailableInMarket,
  );

  const defaultVariant = pickDefaultVariant(variants);

  if (variants.length === 0) {
    return {
      ...product,
      variants: [],
      defaultVariant: null,
      unavailableInMarket: true,
      allVariants: normalizedVariants,
      marketVariantCount: 0,
    };
  }

  return {
    ...product,
    variants,
    defaultVariant,
    unavailableInMarket: false,
    marketVariantCount: variants.length,
  };
}
