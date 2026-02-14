import { getProducts } from "@/actions/product";
import { Button } from "antd";
import Link from "next/link";
import ProductCard from "@/components/store/product-card";
import { ProductStatus } from "@prisma/client";
import PerfumeShopTemplate from "@/components/templates/perfume";

export default async function HomePage() {
  const { products } = await getProducts(1, 4, ProductStatus.ACTIVE);

  return (
    <div>
      <PerfumeShopTemplate products={products} />
    </div>
  );
}
