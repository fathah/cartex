import { getProducts } from "@/actions/product";
import ProductCard from "@/components/store/ProductCard";
import { ProductStatus } from "@prisma/client";

export default async function StorePage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const { products, total } = await getProducts(page, 20, ProductStatus.ACTIVE);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}

      {/* Simple Pagination */}
      {total > 20 && (
        <div className="mt-12 flex justify-center">
          {/* Implement pagination components */}
        </div>
      )}
    </div>
  );
}
