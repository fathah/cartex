import React from "react";
import Link from "next/link";

export default function Promotional() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <div className="md:w-[45%] space-y-8">
          <div className="inline-block px-3 py-1 bg-[#E8D4C5] text-[#8B5E3C] text-xs font-bold tracking-wider uppercase rounded-sm mb-2">
            Signature Collection
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif text-[#4A3B32] leading-tight">
            The Art of Fine <br /> Perfumery
          </h2>
          <p className="text-[#6D5D52] leading-relaxed text-lg">
            Immerse yourself in a world of captivating scents. Our handpicked
            selection of artisanal perfumes and pure aromatic oils are expertly
            crafted to evoke memories and define your unique aura.
          </p>
          <div className="pt-4">
            <Link href="/categories">
              <button className="bg-[#6F4E37] text-white px-8 py-4 uppercase text-xs tracking-widest font-semibold hover:bg-[#5D4030] transition-colors shadow-lg shadow-[#6F4E37]/20">
                Discover the Collection
              </button>
            </Link>
          </div>
        </div>

        <div className="md:w-[55%] relative group">
          {/* Decorative background blob/card */}
          <div className="absolute inset-0 bg-[#FDF8F5] rounded-3xl transform translate-x-4 translate-y-4 -z-10 transition-transform duration-500 group-hover:translate-x-6 group-hover:translate-y-6"></div>

          <div className="relative h-96 md:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=2000"
              alt="Artisanal Perfume Collection"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-in-out"
            />
            {/* Elegant overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
