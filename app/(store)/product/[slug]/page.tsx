import { getProductBySlug } from "@/actions/product";
import ProductDetail from "@/components/store/ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ProductDetail product={product} />
    </div>
  );
}
