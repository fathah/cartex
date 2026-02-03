"use client";

import React, { useState, useEffect } from "react";
import { Button, Tag, Divider, InputNumber, message } from "antd";
import { ShoppingCart } from "lucide-react";
import { AppConstants } from "@/constants/constants";
import { useCartStore } from "@/lib/store/cart";

interface ProductDetailProps {
  product: any;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

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

    const price = Number(currentVariant.price);

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
    ? currentVariant.price
    : product.variants[0]?.price || "0.00";
  const isOutOfStock = currentVariant
    ? currentVariant.inventory?.quantity <= 0
    : false;
  const stockCount = currentVariant?.inventory?.quantity || 0;

  // Media handling
  const images =
    product.mediaProducts?.length > 0
      ? product.mediaProducts.map((mp: any) => mp.media.url)
      : ["/placeholder.png"]; // Fallback
  const [mainImage, setMainImage] = useState(images[0]);

  // Update main image when product changes
  useEffect(() => {
    if (product.mediaProducts?.length > 0) {
      const imgUrl = `${AppConstants.DRIVE_ROOT_URL}/${product.mediaProducts[0].media.url}`;
      setMainImage(imgUrl);
    }
  }, [product]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 ">
      {/* Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="bg-[#f4f4f4] rounded-2xl h-[500px] flex items-center justify-center overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={product.name}
            className="object-contain max-h-full max-w-full mix-blend-multiply"
          />
        </div>
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img: string, idx: number) => {
              const imgUrl = `${AppConstants.DRIVE_ROOT_URL}/${img}`;

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
                    src={imgUrl}
                    alt={`View ${idx}`}
                    className="object-contain w-14 h-14 mix-blend-multiply"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          {product.name}
        </h1>
        <p className="text-gray-500 mb-4 text-sm leading-relaxed max-w-md">
          {product.description || "No Description"}
        </p>

        {/* Rating Placeholder */}
        <div className="flex items-center gap-1 mb-6 text-sm">
          <div className="flex text-[#003d29]">
            {"★★★★★".split("").map((c, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <span className="text-gray-500">(121)</span>
        </div>

        <div className="mb-8 pb-8 border-b border-gray-100">
          <div className="text-2xl font-bold mb-1">
            ${Number(price).toFixed(2)}
          </div>
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

        <Divider className="my-6 border-transparent" />

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
            {stockCount > 0 && stockCount < 20 && (
              <span className="text-orange-500 font-medium mb-1">
                Only{" "}
                <span className="text-orange-600 font-bold">
                  {stockCount} Items
                </span>{" "}
                Left!
              </span>
            )}
            <span className="text-gray-500">Don't miss it</span>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            type="primary"
            size="large"
            shape="round"
            className="bg-[#003d29] hover:bg-[#002a1c] h-12 px-8 text-base font-medium flex-grow md:flex-grow-0 min-w-[160px]"
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
            className="h-12 px-8 text-base font-medium border-2 border-[#003d29] text-[#003d29] hover:bg-green-50 flex-grow md:flex-grow-0 min-w-[160px]"
            disabled={isOutOfStock || !currentVariant}
            onClick={addToCart}
          >
            Add to Cart
          </Button>
        </div>

        {/* Delivery Info */}
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
          <div className="p-4 flex gap-4">
            <div className="text-orange-500 mt-1">
              <ShoppingCart size={20} />
            </div>{" "}
            {/* Placeholder icon */}
            <div>
              <div className="font-semibold text-sm">Free Delivery</div>
              <div className="text-xs text-gray-500 underline cursor-pointer">
                Enter your Postal code for Delivery Availability
              </div>
            </div>
          </div>
          <div className="p-4 flex gap-4">
            <div className="text-orange-500 mt-1">
              <ShoppingCart size={20} />
            </div>{" "}
            {/* Placeholder icon */}
            <div>
              <div className="font-semibold text-sm">Return Delivery</div>
              <div className="text-xs text-gray-500">
                Free 30days Delivery Returns.{" "}
                <span className="underline cursor-pointer">Details</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
