"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button, message } from "antd";
import { addToWishlist, removeFromWishlist } from "@/actions/wishlists";

interface WishlistButtonProps {
  productId: string;
  initialIsInWishlist?: boolean;
  variant?: "icon" | "button";
  size?: "small" | "middle" | "large";
}

export default function WishlistButton({
  productId,
  initialIsInWishlist = false,
  variant = "icon",
  size = "middle",
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);

    try {
      if (isInWishlist) {
        const result = await removeFromWishlist(productId);
        if (result.success) {
          setIsInWishlist(false);
          message.success("Removed from wishlist");
        } else {
          message.error(result.error || "Failed to remove from wishlist");
        }
      } else {
        const result = await addToWishlist(productId);
        if (result.success) {
          setIsInWishlist(true);
          message.success("Added to wishlist");
        } else {
          message.error(result.error || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`p-2 rounded-full transition-all ${
          isInWishlist
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        } disabled:opacity-50`}
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={20} className={isInWishlist ? "fill-current" : ""} />
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      loading={loading}
      size={size}
      icon={<Heart size={16} className={isInWishlist ? "fill-current" : ""} />}
      className={
        isInWishlist ? "text-red-500 border-red-500 hover:bg-red-50" : ""
      }
    >
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
