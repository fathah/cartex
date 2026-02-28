import { getProducts, getFeaturedProducts } from "@/actions/product";
import { ProductStatus } from "@prisma/client";
import PerfumeShopTemplate from "@/components/templates/perfume";
import { getSettings } from "@/actions/settings";

export default async function HomePage() {
  const [{ products }, featuredProducts] = await Promise.all([
    getProducts(1, 4, ProductStatus.ACTIVE),
    getFeaturedProducts(4),
  ]);
  const settings = await getSettings();

  return (
    <div>
      <PerfumeShopTemplate
        products={products}
        featuredProducts={featuredProducts}
        settings={settings}
      />
    </div>
  );
}
