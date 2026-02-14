import { getProducts } from "@/actions/product";
import ProductListClient from "./product-list-client";

export default async function ProductsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const { products, total } = await getProducts(page);

  return (
    <ProductListClient
      initialProducts={products}
      total={total}
      currentPage={page}
    />
  );
}
