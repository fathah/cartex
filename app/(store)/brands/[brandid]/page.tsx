import { getBrandProducts } from "@/actions/product";
import { getBrand } from "@/actions/brands";
import { ProductStatus } from "@prisma/client";
import ProductCard from "@/components/store/ProductCard";
import { Package, Component } from "lucide-react";
import { notFound } from "next/navigation";
import { PUBLIC_ENV } from "@/constants/env_public";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ brandid: string }>;
}

export default async function BrandProductsIndex({ params }: PageProps) {
  const resolvedParams = await params;
  const brandId = resolvedParams.brandid;

  const [brand, { products }] = await Promise.all([
    getBrand(brandId),
    getBrandProducts(brandId, 1, 24, ProductStatus.ACTIVE),
  ]);

  if (!brand) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-4">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-200 overflow-hidden mix-blend-multiply">
            {brand.logo ? (
              <img
                src={`${PUBLIC_ENV.DRIVE_ROOT_URL}/${brand.logo}`}
                alt={brand.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <Component size={40} />
            )}
          </div>
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4 font-serif">
          {brand.name}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explore our exclusive collection of {brand.name} products.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 mt-8">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600">
            No products found
          </h2>
          <p className="text-gray-400 mt-2">
            Stay tuned for exciting new releases from {brand.name}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
