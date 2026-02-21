"use server";

import ProductReviewDB, { CreateProductReviewData } from "@/db/product_review";
import { getCurrentUser } from "./user";

export async function addReview(
  productId: string,
  rating: number,
  comment?: string,
  variantId?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const canReview = await ProductReviewDB.canCustomerReview(
      productId,
      user.id,
    );

    if (!canReview) {
      return {
        success: false,
        error:
          "You must purchase this product before you can leave a review, or you have already reviewed it.",
      };
    }

    const data: CreateProductReviewData = {
      productId,
      customerId: user.id,
      rating,
      comment,
      variantId,
    };

    const review = await ProductReviewDB.create(data);
    return { success: true, review };
  } catch (error) {
    console.error("Failed to add review:", error);
    return {
      success: false,
      error: "Failed to submit review. Try again later.",
    };
  }
}

export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10,
) {
  try {
    const data = await ProductReviewDB.findByProductId(productId, page, limit);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return { success: false, error: "Failed to load reviews" };
  }
}

export async function checkCanReview(productId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: true, canReview: false };

    const canReview = await ProductReviewDB.canCustomerReview(
      productId,
      user.id,
    );
    return { success: true, canReview };
  } catch (error) {
    console.error("Checking review eligibility failed", error);
    return { success: false, canReview: false };
  }
}
