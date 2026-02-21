import { getCategories } from "@/actions/categories";
import { getMediaUrl } from "@/utils/media_url";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesIndex() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-serif">
          Our Collections
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Explore our wide range of curated collections designed specifically
          for your needs. Discover the essence of elegance.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600">
            No collections found
          </h2>
          <p className="text-gray-400 mt-2">
            Check back later for new arrivals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group block"
            >
              <div className="relative aspect-4/5 bg-[#f8f8f8] rounded-2xl overflow-hidden mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                {category.imageId ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getMediaUrl(category.imageId)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                    <Package size={56} strokeWidth={1} />
                  </div>
                )}
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="flex items-start justify-between px-2">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#6F4E37] transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  {category._count?.products !== undefined && (
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      {category._count.products}{" "}
                      {category._count.products === 1 ? "Product" : "Products"}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-[#f4f4f4] flex items-center justify-center group-hover:bg-[#6F4E37] group-hover:text-white transition-all duration-300 text-gray-400 group-hover:scale-110 shrink-0">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
