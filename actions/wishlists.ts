"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user";
import WishlistDB from "@/db/wishlist";

export async function getWishlist() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  return await WishlistDB.findByCustomer(user.id);
}

export async function addToWishlist(productId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // Check if already in wishlist
    const exists = await WishlistDB.exists(user.id, productId);

    if (exists) {
      return { success: false, error: "Product already in wishlist" };
    }

    await WishlistDB.create(user.id, productId);
    revalidatePath("/account/wishlist");

    return { success: true };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false, error: "Failed to add to wishlist" };
  }
}

export async function removeFromWishlist(productId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  try {
    await WishlistDB.delete(user.id, productId);
    revalidatePath("/account/wishlist");

    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false, error: "Failed to remove from wishlist" };
  }
}

export async function getWishlistCount() {
  const user = await getCurrentUser();

  if (!user) {
    return 0;
  }

  return await WishlistDB.count(user.id);
}
