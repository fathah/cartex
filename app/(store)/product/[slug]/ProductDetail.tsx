"use client";

import React, { useState, useEffect } from "react";
import { Button, Tag, Divider, InputNumber, message } from "antd";
import { ShoppingCart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { AppConstants } from "@/constants/constants";
import { useCartStore } from "@/lib/store/cart";
import Currency from "../../../../components/common/Currency";
import ProductReviews from "../../../../components/store/ProductReviews";
import { getProductReviews } from "@/actions/reviews";
import Link from "next/link";

interface ProductDetailProps {
  product: any;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Initial selection
  useEffect(() => {
    if (product.options && product.options.length > 0) {
      const defaults: any = {};
      product.options.forEach((opt: any) => {
        if (opt.values.length > 0) {
          defaults[opt.name] = opt.values[0].value;
        }
      });
      setSelectedOptions(defaults);
    } else if (product.variants.length > 0) {
      // No options but variants (e.g. default variant)
      setCurrentVariant(product.variants[0]);
    }
  }, [product]);

  // Update variant based on selection
  useEffect(() => {
    if (Object.keys(selectedOptions).length > 0) {
      const variant = product.variants.find((v: any) => {
        // Check if variant has ALL selected values.
        const variantValues = v.selectedOptions.map((so: any) => so.value);
        const selectedValues = Object.values(selectedOptions);
        return (
          selectedValues.every((sv) => variantValues.includes(sv)) &&
          variantValues.length === selectedValues.length
        );
      });
      setCurrentVariant(variant || null);
    }
  }, [selectedOptions, product.variants]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const addToCartStore = useCartStore((state) => state.addToCart);

  const addToCart = () => {
    if (!currentVariant) {
      message.error("Please select options");
      return;
    }

    const price = Number(currentVariant.salePrice);

    addToCartStore({
      key: `${product.id}-${currentVariant.id}`,
      productId: product.id,
      variantId: currentVariant.id,
      name: product.name,
      variantTitle: currentVariant.title,
      price: price,
      quantity: quantity,
      image: mainImage,
      slug: product.slug,
    });

    message.success(`Added ${quantity} x ${product.name} to cart`);
  };

  const price = currentVariant
    ? currentVariant.salePrice
    : product.variants[0]?.salePrice || "0.00";
  const originalPrice = currentVariant
    ? currentVariant.originalPrice
    : product.variants[0]?.originalPrice || price;

  const hasDiscount = Number(price) < Number(originalPrice);
  const discountPercentage = hasDiscount
    ? Math.round(
        ((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100,
      )
    : 0;

  const stockCount = currentVariant?.inventory?.quantity || 0;
  const isOutOfStock = currentVariant ? stockCount <= 0 : true;

  const getFullImageUrl = (url: string) => {
    if (!url) return "/placeholder.png";
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `${AppConstants.DRIVE_ROOT_URL}/${url}`;
  };

  // Media handling
  const images =
    product.mediaProducts?.length > 0
      ? product.mediaProducts.map((mp: any) => getFullImageUrl(mp.media.url))
      : ["/placeholder.png"]; // Fallback
  const [mainImage, setMainImage] = useState(images[0]);

  // Update main image when product changes
  useEffect(() => {
    setMainImage(images[0]);
    // Fetch aggregated data
    getProductReviews(product.id, 1, 1).then((res) => {
      if (res.success && res.data) {
        setAvgRating(res.data.averageRating);
        setReviewCount(res.data.total);
      }
    });
  }, [product.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 ">
      {/* Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="bg-[#f4f4f4] rounded-2xl h-[500px] flex items-center justify-center overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={product.name}
            className={`max-h-full max-w-full mix-blend-multiply ${
              mainImage.toLowerCase().endsWith(".png")
                ? "object-contain p-8"
                : "object-cover w-full h-full"
            }`}
          />
        </div>
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img: string, idx: number) => {
              return (
                <div
                  key={idx}
                  className={`
                                    w-20 h-20 bg-[#f4f4f4] rounded-lg cursor-pointer flex-shrink-0 flex items-center justify-center border-2 
                                    ${mainImage === img ? "border-black" : "border-transparent"}
                                `}
                  onClick={() => setMainImage(img)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`View ${idx}`}
                    className={`mix-blend-multiply ${
                      img.toLowerCase().endsWith(".png")
                        ? "object-contain w-14 h-14"
                        : "object-cover w-full h-full rounded-md"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        {product.brand && (
          <div className="mb-2 inline-block">
            <Link href={`/brands/${product.brand.id}`}>
              {product.brand.logo ? (
                <img
                  src={getFullImageUrl(product.brand.logo)}
                  alt={product.brand.name}
                  className="h-16 object-contain"
                />
              ) : (
                <span className=" text-gray-600 bg-gray-200 px-2 py-1 rounded-lg font-medium tracking-wide text-sm uppercase mb-1">
                  {product.brand.name}
                </span>
              )}
            </Link>
          </div>
        )}
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          {product.name}
        </h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-md">
          {product.description || ""}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-6 text-sm">
          <div className="flex text-[#003d29]">
            {"★★★★★".split("").map((c, i) => (
              <span
                key={i}
                className={
                  i < Math.round(avgRating) ? "text-[#003d29]" : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-gray-500">
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        <div className="mb-8 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-1">
            <div className="text-3xl font-bold font-sans text-gray-900">
              <Currency value={Number(price)} />
            </div>
            {hasDiscount && (
              <>
                <div className="text-lg text-gray-400 line-through font-medium">
                  <Currency value={Number(originalPrice)} />
                </div>
                <Tag
                  color="success"
                  className="font-bold px-2 py-1 text-xs border-0 rounded-md"
                >
                  {discountPercentage}% OFF
                </Tag>
              </>
            )}
          </div>
          {hasDiscount && (
            <div className="text-sm text-green-600 font-medium">
              You save{" "}
              <Currency value={Number(originalPrice) - Number(price)} />!
            </div>
          )}
        </div>

        {/* Options */}
        {product.options.map((opt: any) => (
          <div key={opt.id} className="mb-6">
            <h3 className="text-base font-semibold mb-3">
              Choose a {opt.name}
            </h3>
            <div className="flex gap-3">
              {opt.values.map((val: any) => {
                const isSelected = selectedOptions[opt.name] === val.value;
                // Basic Color Logic (Needs real color codes later)
                const isColor = opt.name.toLowerCase() === "color";
                const colorMap: any = {
                  Green: "#a3bfaa",
                  Black: "#333",
                  Blue: "#6b8cae",
                  Silver: "#e0e0e0",
                  Pink: "#e8b8b8",
                };
                const bg = isColor ? colorMap[val.value] || "#ddd" : "white";

                return (
                  <button
                    key={val.id}
                    onClick={() => handleOptionChange(opt.name, val.value)}
                    className={`
                                        ${
                                          isColor
                                            ? `w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSelected ? "ring-2 ring-offset-2 ring-[#003d29]" : ""}`
                                            : `px-6 py-2 rounded-full text-sm font-medium transition-colors border ${isSelected ? "bg-[#003d29] text-white border-[#003d29]" : "bg-gray-100 text-gray-900 border-transparent hover:bg-gray-200"}`
                                        }
                                    `}
                    title={val.value}
                    style={isColor ? { backgroundColor: bg } : {}}
                  >
                    {!isColor && val.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-start gap-6 mb-8">
          <div className="bg-[#f4f4fa] rounded-full flex items-center px-4 py-3 gap-4 font-semibold">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-xl px-2 hover:text-[#003d29]"
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="text-xl px-2 hover:text-[#003d29]"
            >
              +
            </button>
          </div>

          <div className="flex flex-col text-xs mt-2">
            {isOutOfStock ? (
              <span className="text-red-500 font-bold mb-1 text-sm bg-red-50 px-2 py-1 rounded inline-block w-fit">
                Out of Stock
              </span>
            ) : stockCount > 0 && stockCount < 20 ? (
              <span className="text-orange-500 font-medium mb-1">
                Only{" "}
                <span className="text-orange-600 font-bold">
                  {stockCount} Items
                </span>{" "}
                Left!
              </span>
            ) : null}
            {!isOutOfStock && (
              <span className="text-gray-500">Don't miss it</span>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            type="primary"
            size="large"
            shape="round"
            className="bg-[#003d29] hover:bg-[#002a1c] h-12 px-8 text-base font-medium flex-grow md:flex-grow-0 min-w-[160px] disabled:bg-gray-300 disabled:border-transparent disabled:text-white"
            disabled={isOutOfStock || !currentVariant}
            onClick={() => {
              addToCart();
              message.success("Proceeding to checkout...");
            }}
          >
            Buy Now
          </Button>
          <Button
            size="large"
            shape="round"
            className={`h-12 px-8 text-base font-medium border-2 flex-grow md:flex-grow-0 min-w-[160px] ${
              isOutOfStock
                ? "border-gray-200 text-gray-400 bg-gray-50"
                : "border-[#003d29] text-[#003d29] hover:bg-green-50"
            }`}
            disabled={isOutOfStock || !currentVariant}
            onClick={addToCart}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="md:col-span-2 mt-8 pt-12 border-t border-gray-100">
        {product.descriptionLong && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Product Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {product.descriptionLong}
              </ReactMarkdown>
            </div>
          </div>
        )}
        <ProductReviews productId={product.id} variantId={currentVariant?.id} />
      </div>
    </div>
  );
}
