import { getProducts } from "@/actions/product";
import { ProductStatus } from "@prisma/client";
import PerfumeShopTemplate from "@/components/templates/perfume";
import { getSettings } from "@/actions/settings";

export default async function HomePage() {
  const { products } = await getProducts(1, 4, ProductStatus.ACTIVE);
  const settings = await getSettings();

  return (
    <div>
      <PerfumeShopTemplate products={products} settings={settings} />
    </div>
  );
}
