import { notFound } from "next/navigation";
import { Metadata } from "next";
import CollectionDB from "@/db/collection";
import ProductCard from "@/components/store/ProductCard";
import { Package } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{
    catslug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { catslug } = await params;
  const collection = await CollectionDB.findBySlug(catslug);

  if (!collection) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${collection.name} | Shop Collection`,
    description:
      collection.description || `Browse our ${collection.name} collection`,
  };
}

export default async function CategoryItemsView({ params }: CategoryPageProps) {
  const { catslug } = await params;

  const collection = await CollectionDB.findBySlugWithDetails(catslug);

  if (!collection) {
    notFound();
  }

  const products = collection.products || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 border-b pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-gray-600 text-lg max-w-3xl">
              {collection.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4">
            <p className="text-sm text-gray-500">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 max-w-md">
              This collection doesn't have any products yet. Check back soon for
              new arrivals!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
