import { getProducts } from "@/actions/product";
import { ProductStatus } from "@prisma/client";
import ProductCard from "@/components/store/product-card";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const { products } = await getProducts(1, 24, ProductStatus.ACTIVE);

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4 font-serif">
          What&prime;s New
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Discover our latest arrivals and exclusive deals. Check out the newest
          products in our store.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 mt-8">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600">
            No products found
          </h2>
          <p className="text-gray-400 mt-2">
            Check back later for new arrivals.
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
