"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Rate, Avatar, List, message } from "antd";
import { User } from "lucide-react";
import {
  addReview,
  getProductReviews,
  checkCanReview,
} from "@/actions/reviews";
import dayjs from "dayjs";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    fullname: string;
  };
  variant?: {
    title: string;
  } | null;
}

interface ProductReviewsProps {
  productId: string;
  variantId?: string;
  className?: string;
}

export default function ProductReviews({
  productId,
  variantId,
  className = "",
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [productId, page]);

  const checkEligibility = async () => {
    const res = await checkCanReview(productId);
    if (res.success) {
      setCanReview(res.canReview || false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    const res = await getProductReviews(productId, page, 5);
    if (res.success && res.data) {
      setReviews(res.data.reviews as any);
      setTotal(res.data.total);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      message.error("Please provide a star rating.");
      return;
    }

    setSubmitting(true);
    const res = await addReview(productId, rating, comment, variantId);

    if (res.success) {
      message.success("Thank you! Your review has been submitted.");
      setRating(0);
      setComment("");
      setCanReview(false); // Can only review once
      fetchReviews();
    } else {
      message.error(res.error || "Failed to submit review.");
    }
    setSubmitting(false);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <h2 className="text-2xl font-bold">Customer Reviews</h2>

      {canReview && (
        <div className="bg-[#f4f4fa] p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-lg">Write a Review</h3>
          <p className="text-sm text-gray-500">
            Share your thoughts on this product with other customers.
          </p>

          <div className="flex flex-col gap-4 max-w-xl">
            <div>
              <div className="text-sm font-medium mb-1">Rating</div>
              <Rate value={rating} onChange={setRating} />
            </div>

            <div>
              <div className="text-sm font-medium mb-1">Comment (Optional)</div>
              <Input.TextArea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike?"
              />
            </div>

            <Button
              type="primary"
              className="bg-[#003d29] w-fit"
              onClick={handleSubmit}
              loading={submitting}
            >
              Submit Review
            </Button>
          </div>
        </div>
      )}

      {/* Review List */}
      <List
        className="max-w-4xl"
        loading={loading}
        itemLayout="horizontal"
        dataSource={reviews}
        pagination={{
          onChange: (p) => setPage(p),
          pageSize: 5,
          total: total,
          hideOnSinglePage: true,
        }}
        locale={{
          emptyText: "No reviews yet. Be the first to share your thoughts!",
        }}
        renderItem={(item) => (
          <List.Item className="border-b border-gray-100 py-6">
            <List.Item.Meta
              avatar={
                <Avatar size="large" icon={<User />} className="bg-[#003d29]" />
              }
              title={
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base">
                    {item.customer?.fullname || "Verified Buyer"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {dayjs(item.createdAt).format("MMM D, YYYY")}
                  </span>
                </div>
              }
              description={
                <div className="mt-2 space-y-2">
                  <Rate
                    disabled
                    defaultValue={item.rating}
                    className="text-sm text-[#003d29]"
                  />
                  {item.variant && (
                    <div className="text-xs text-gray-500 font-medium bg-gray-100 rounded px-2 py-1 w-fit">
                      Purchased: {item.variant.title}
                    </div>
                  )}
                  {item.comment && (
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {item.comment}
                    </p>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
