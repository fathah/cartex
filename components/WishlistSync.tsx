"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { getWishlist } from "@/actions/wishlists";

export default function WishlistSync() {
  const setWishlistItems = useWishlistStore((state) => state.setWishlistItems);

  useEffect(() => {
    const syncWishlist = async () => {
      try {
        const wishlistItems = await getWishlist();
        const productIds = wishlistItems.map((item: any) => item.productId);
        setWishlistItems(productIds);
      } catch (error) {
        console.log("Could not sync wishlist");
      }
    };

    syncWishlist();
  }, [setWishlistItems]);

  return null;
}
