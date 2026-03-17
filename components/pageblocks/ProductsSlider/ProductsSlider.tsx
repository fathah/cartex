"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/components/store/ProductCard";
import {
  getCollectionProducts,
  getProductsByIds,
  getProducts,
  getDeals,
} from "@/actions/product";
import { ProductStatus } from "@prisma/client";

interface ProductsSliderProps {
  title?: string;
  subtitle?: string;
  alignment?: "left" | "center" | "right";
  sourceType?: "COLLECTION" | "LATEST" | "OFFER" | "CUSTOM";
  collectionId?: string;
  productIds?: string[];
  limit?: number;
  backgroundColor?: string;
}

const ProductsSlider = ({
  title,
  subtitle,
  alignment = "left",
  sourceType,
  collectionId,
  productIds,
  limit = 10,
  backgroundColor,
}: ProductsSliderProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let fetchedProducts = [];
        if (sourceType === "COLLECTION" && collectionId) {
          const res = await getCollectionProducts(
            collectionId,
            1,
            limit,
            ProductStatus.ACTIVE,
          );
          fetchedProducts = res.products;
        } else if (sourceType === "LATEST") {
          const res = await getProducts(1, limit, ProductStatus.ACTIVE);
          fetchedProducts = res.products;
        } else if (sourceType === "OFFER") {
          const res = await getDeals(1, limit, ProductStatus.ACTIVE);
          fetchedProducts = res.products;
        } else if (
          sourceType === "CUSTOM" &&
          productIds &&
          productIds.length > 0
        ) {
          fetchedProducts = await getProductsByIds(productIds);
        } else if (collectionId) {
          const res = await getCollectionProducts(
            collectionId,
            1,
            limit,
            ProductStatus.ACTIVE,
          );
          fetchedProducts = res.products;
        } else if (productIds && productIds.length > 0) {
          fetchedProducts = await getProductsByIds(productIds);
        }
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sourceType, collectionId, productIds, limit]);

  if (loading) {
    return (
      <section className="py-16 overflow-hidden" style={{ backgroundColor }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="min-w-[280px] w-[280px] h-80 bg-gray-100 animate-pulse rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const lineAlignmentClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  return (
    <section className="py-16 overflow-hidden" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto px-6">
        {title && (
          <div className={`mb-10 ${alignmentClasses[alignment]}`}>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p
                className={`text-gray-500 mt-2 max-w-2xl ${lineAlignmentClasses[alignment]}`}
              >
                {subtitle}
              </p>
            )}
            <div
              className={`w-20 h-1 bg-primary mt-4 ${lineAlignmentClasses[alignment]}`}
            ></div>
          </div>
        )}
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="min-w-[280px] w-[280px] snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSlider;
