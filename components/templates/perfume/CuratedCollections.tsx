import React from "react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";

interface CuratedCollectionsProps {
  products: any[];
}

const CuratedCollections: React.FC<CuratedCollectionsProps> = ({
  products,
}) => {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-serif mb-12 relative inline-block">
        Curated Collections
        <span className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#E8D4C5]/30 rounded-full blur-xl"></span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
        {products.length > 0 ? (
          products.map((p) => <ProductCard product={p} key={p.id} />)
        ) : (
          <div className="col-span-full text-center text-gray-400 italic">
            Add featured products to see collections
          </div>
        )}
      </div>

      <div className="mt-12">
        <Link href="/categories">
          <button className="bg-[#6F4E37] text-white px-8 py-4 uppercase text-xs tracking-widest hover:bg-[#5D4030] transition-colors rounded-xl">
            View Full Collection
          </button>
        </Link>
      </div>
    </section>
  );
};

export default CuratedCollections;
