"use client";

import React, { useState } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Button, message, Empty } from "antd";
import { removeFromWishlist } from "./actions";
import { getMediaUrl } from "@/utils/media_url";
import Link from "next/link";
import Currency from "@/components/common/Currency";

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    variants: Array<{
      price: any; // Decimal type from Prisma
    }>;
    collections: Array<{
      name: string;
    }>;
    mediaProducts: Array<{
      media: {
        url: string;
      };
    }>;
  };
}

interface WishlistClientProps {
  initialItems: WishlistItem[];
}

export default function WishlistClient({ initialItems }: WishlistClientProps) {
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      const result = await removeFromWishlist(productId);

      if (result.success) {
        setItems(items.filter((item) => item.productId !== productId));
        message.success("Removed from wishlist");
      } else {
        message.error(result.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setRemovingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>

        <div className="bg-white rounded-lg shadow-sm border p-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-2">
                <p className="text-gray-500 text-lg">Your wishlist is empty</p>
                <p className="text-gray-400 text-sm">
                  Save items you love to your wishlist
                </p>
              </div>
            }
          >
            <Link href="/store">
              <Button
                type="primary"
                size="large"
                className="bg-[#4A3B32] hover:bg-[#2d241e] border-none"
              >
                Start Shopping
              </Button>
            </Link>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <Heart className="text-red-500 fill-red-500" size={28} />
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const imageUrl = item.product.mediaProducts[0]?.media?.url;
          const price = item.product.variants[0]?.price
            ? Number(item.product.variants[0].price)
            : 0;
          const category = item.product.collections[0];

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Product Image */}
              <Link href={`/product/${item.product.slug}`}>
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={getMediaUrl(imageUrl)}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Remove Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(item.productId);
                    }}
                    disabled={removingId === item.productId}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2
                      size={18}
                      className={
                        removingId === item.productId
                          ? "text-gray-400"
                          : "text-red-500"
                      }
                    />
                  </button>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {category && (
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {category.name}
                  </p>
                )}

                <Link href={`/product/${item.product.slug}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-[#4A3B32] transition-colors">
                    {item.product.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    <Currency value={price} />
                  </span>
                </div>

                {/* Add to Cart Button */}
                <Link href={`/product/${item.product.slug}`}>
                  <Button
                    type="primary"
                    icon={<ShoppingCart size={16} />}
                    className="w-full bg-[#4A3B32] hover:bg-[#2d241e] border-none"
                    size="large"
                  >
                    View Product
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
