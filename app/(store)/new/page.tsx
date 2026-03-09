import { getProducts } from "@/actions/product";
import ProductCard from "@/components/store/ProductCard";
import { ProductStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const NewItems = async () => {
  const { products } = await getProducts(1, 16, ProductStatus.ACTIVE);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">What&prime;s New</h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No new products found.
        </div>
      )}
    </div>
  );
};

export default NewItems;
