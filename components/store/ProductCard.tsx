"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Image as ImageIcon, Check } from "lucide-react";
import { getMediaUrl } from "@/utils/media_url";
import Currency from "@/components/common/Currency";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { message } from "antd";
import { addToWishlist, removeFromWishlist } from "@/actions/wishlists";
import { useCurrency } from "@/components/providers/currency-provider";

export default function ProductCard({ product }: { product: any }) {
  const displayVariant = product.defaultVariant || product.variants?.[0];
  const salePrice = displayVariant?.effectiveSalePrice || 0;
  const compareAtPrice = displayVariant?.effectiveCompareAtPrice || 0;
  const stockCount = displayVariant?.effectiveInventoryQuantity || 0;
  const minQuantity = Math.max(
    1,
    Number(displayVariant?.effectiveMinOrderQty || 1),
  );
  const maxQuantity =
    displayVariant?.effectiveMaxOrderQty === null ||
    displayVariant?.effectiveMaxOrderQty === undefined
      ? null
      : Math.max(minQuantity, Number(displayVariant.effectiveMaxOrderQty));
  const isUnavailableInRegion = product.unavailableInMarket === true;
  const isOutOfStock = displayVariant ? stockCount < minQuantity : true;
  const { currency, marketCode } = useCurrency();

  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.items);

  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product.id),
  );
  const addToWishlistStore = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlistStore = useWishlistStore(
    (state) => state.removeFromWishlist,
  );

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useWishlistStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const isAddedToCart =
    mounted && cartItems.some((item) => item.productId === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUnavailableInRegion || isOutOfStock || !displayVariant) {
      return;
    }

    const variantId = displayVariant?.id;
    addToCart({
      key: `${product.id}${variantId ? `-${variantId}` : ""}`,
      productId: product.id,
      name: product.name,
      price: Number(salePrice),
      quantity: minQuantity,
      minQuantity,
      maxQuantity,
      image: product.mediaProducts?.[0]?.media?.url,
      variantId: variantId,
      variantTitle: displayVariant?.title,
      slug: product.slug,
      currencyCode: currency,
      marketCode,
    });
    // Removed the message.success("Added to cart") since the UI now shows it immediately
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        const result = await removeFromWishlist(product.id);
        if (result.success) {
          removeFromWishlistStore(product.id);
          message.success("Removed from wishlist");
        } else {
          message.error(result.error || "Failed to remove from wishlist");
        }
      } else {
        const result = await addToWishlist(product.id);
        if (result.success) {
          addToWishlistStore(product.id);
          message.success("Added to wishlist");
        } else {
          message.error(result.error || "Failed to add to wishlist");
        }
      }
    } catch (error: any) {
      message.error("An error occurred");
    } finally {
      setWishlistLoading(false);
    }
  };

  const brandLogo = product.brand?.logo;
  const brandId = product.brand?.id;

  const gradientClass =
    "bg-linear-to-tr from-[#FDF8F5] via-[#FFF] to-[#F3E1D5]";

  return (
    <div className="group flex flex-col h-full bg-white border border-gray-100 rounded-2xl hover:shadow-lg duration-300">
      {/* Image Container */}
      <div
        className={`relative aspect-square rounded-t-2xl mb-4 overflow-hidden ${gradientClass} transition-colors`}
        style={{
          backgroundImage: "url('/images/patterns/clean-gray-paper.png')",
        }}
      >
        <Link
          href={`/product/${product.slug}`}
          className={`block w-full h-full ${
            product.mediaProducts?.[0]?.media?.url
              ?.toLowerCase()
              .endsWith(".png")
              ? "p-6"
              : ""
          }`}
        >
          {product.mediaProducts?.[0]?.media?.url ? (
            <img
              alt={product.name}
              src={getMediaUrl(product.mediaProducts[0].media.url)}
              className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${
                product.mediaProducts[0].media.url
                  .toLowerCase()
                  .endsWith(".png")
                  ? "object-contain mix-blend-multiply"
                  : "object-cover"
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={48} strokeWidth={1.5} />
            </div>
          )}
        </Link>

        {isOutOfStock && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm z-10">
            Out of Stock
          </div>
        )}
        {brandLogo && brandId && (
          <Link
            href={`/brands/${brandId}`}
            className="absolute bottom-2 left-4 "
            target="_blank"
          >
            <img
              src={getMediaUrl(brandLogo)}
              alt="Brand Logo"
              className="h-10 object-contain"
            />
          </Link>
        )}

        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading || !mounted}
          className={`absolute z-10 top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 ${
            mounted && isInWishlist
              ? "text-red-500"
              : "text-gray-700 hover:text-red-500"
          } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Heart
            size={18}
            className={mounted && isInWishlist ? "fill-current" : ""}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-6 pb-6">
        <div className="flex justify-between items-start mb-1">
          <Link
            href={`/product/${product.slug}`}
            className="font-bold text-gray-900 hover:text-emerald-800 transition-colors text-lg line-clamp-1"
          >
            {product.name}
          </Link>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Currency
              value={salePrice}
              className="font-bold text-green-600 shrink-0"
            />
            <span className="text-xs text-gray-400">
              {compareAtPrice > salePrice && (
                <Currency value={compareAtPrice} className="line-through" />
              )}
            </span>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-2 line-clamp-1">
          {product.collections?.[0]?.name || "Uncategorized"}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={isUnavailableInRegion || isOutOfStock || isAddedToCart}
          className={`w-full mt-auto py-2.5 rounded-full border font-medium text-sm transition-all active:scale-95 ${
            isUnavailableInRegion || isOutOfStock
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : isAddedToCart
                ? "bg-emerald-50 border-emerald-200 text-emerald-600 flex items-center justify-center gap-2 cursor-default"
                : "border-gray-900 hover:bg-gray-900 hover:text-white"
          }`}
        >
          {isUnavailableInRegion ? (
            "Unavailable"
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : isAddedToCart ? (
            <>
              <Check size={16} className="text-emerald-500" />
              Added to Cart
            </>
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </div>
  );
}
