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
  const price = product.variants?.[0]?.price || 0;
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
      price: Number(price),
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
      <div className="relative aspect-square rounded-2xl mb-4 overflow-hidden  transition-colors">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full p-6"
        >
          {product.mediaProducts?.[0]?.media?.url ? (
            <img
              alt={product.name}
              src={getMediaUrl(product.mediaProducts[0].media.url)}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={48} strokeWidth={1.5} />
            </div>
          )}
        </Link>

        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading || !mounted}
          className={`absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 ${
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
          <div className="font-bold text-green-600 shrink-0">
            <Currency value={price} />
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-2 line-clamp-1">
          {product.collections?.[0]?.name || "Uncategorized"}
        </p>

        <button
          onClick={handleAddToCart}
          className="w-full mt-auto py-2.5 rounded-full border border-gray-900 font-medium text-sm hover:bg-gray-900 hover:text-white transition-all active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
