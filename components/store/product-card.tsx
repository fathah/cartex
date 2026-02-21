"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Image as ImageIcon } from "lucide-react";
import { getMediaUrl } from "@/utils/media_url";
import Currency from "@/components/common/Currency";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { message } from "antd";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/app/account/wishlist/actions";

export default function ProductCard({ product }: { product: any }) {
  const currentVariant = product.variants?.[0];
  const salePrice = currentVariant?.salePrice || 0;
  const originalPrice = currentVariant?.originalPrice || 0;
  const stockCount = currentVariant?.inventory?.quantity || 0;
  const isOutOfStock = currentVariant ? stockCount <= 0 : true;

  const addToCart = useCartStore((state) => state.addToCart);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variantId = product.variants?.[0]?.id;
    addToCart({
      key: `${product.id}${variantId ? `-${variantId}` : ""}`,
      productId: product.id,
      name: product.name,
      price: Number(salePrice),
      quantity: 1,
      image: product.mediaProducts?.[0]?.media?.url,
      variantId: variantId,
      slug: product.slug,
    });
    message.success("Added to cart");
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

  return (
    <div className="group flex flex-col h-full bg-white border border-gray-100 rounded-2xl hover:shadow-lg duration-300">
      {/* Image Container */}
      <div className="relative aspect-square rounded-t-2xl mb-4 overflow-hidden bg-linear-to-tr from-[#FDF8F5] via-[#FFF] to-[#F3E1D5] transition-colors">
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
              {salePrice !== originalPrice && (
                <Currency value={originalPrice} className="line-through" />
              )}
            </span>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-2 line-clamp-1">
          {product.collections?.[0]?.name || "Uncategorized"}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full mt-auto py-2.5 rounded-full border font-medium text-sm transition-all active:scale-95 ${
            isOutOfStock
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-900 hover:bg-gray-900 hover:text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
