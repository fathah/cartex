import { getProducts, getFeaturedProducts } from "@/actions/product";
import { ProductStatus } from "@prisma/client";
import { getSettings } from "@/actions/settings";
import prisma from "@/db/prisma";
import PageRenderer from "@/components/page-renderer";
import CommonHome from "@/components/layout/CommonHome";

export default async function HomePage() {
  const page = await prisma.page.findUnique({
    where: { slug: "home", isPublished: true },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (page) {
    return <PageRenderer blocks={page.blocks as any} />;
  }

  const [{ products }, featuredProducts] = await Promise.all([
    getProducts(1, 8, ProductStatus.ACTIVE),
    getFeaturedProducts(8),
  ]);
  const settings = await getSettings();

  return (
    <CommonHome
      products={products}
      featuredProducts={featuredProducts}
      settings={settings}
    />
  );
}
