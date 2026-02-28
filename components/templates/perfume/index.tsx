"use client";

import React from "react";
import {
  Truck,
  ShieldCheck,
  Headset,
  CreditCard,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Button, Carousel } from "antd";
import { getMediaUrl } from "@/utils/media_url";
import ProductCard from "@/components/store/product-card";
import Testinomials from "./Testinomials";
import Promotional from "./Promotional";
import NewsLetter from "./NewsLetter";
import Footer from "./Footer";
import CuratedCollections from "./CuratedCollections";

interface PerfumeShopProps {
  products?: any[];
  featuredProducts?: any[];
  settings?: any;
}

const PerfumeShopTemplate: React.FC<PerfumeShopProps> = ({
  products = [],
  featuredProducts = [],
  settings,
}) => {
  // Fallback or subset of products for different sections
  const collectionProducts = featuredProducts;
  const latestProducts = products.slice(0, 4);

  return (
    <div className="bg-[#FDF8F5] min-h-screen  text-[#4A3B32]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 lg:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 overflow-hidden">
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <span className="inline-block px-3 py-1 bg-[#E8D4C5] text-[#8B5E3C] text-xs font-bold tracking-wider uppercase rounded-sm">
            Luxury & Premium
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-[#4A3B32] font-black leading-18">
            Revel The Beauty <br className="hidden md:block" /> Inside You
          </h1>
          <p className="text-[#6D5D52] text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Timeless Fragrances, Crafted With Passion, Embody Individuality,
            Elegance, And Sophistication, Leaving A Lasting Impression Always.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
            <Link href="/categories">
              <button className="bg-[#6F4E37] text-white px-8 py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-[#5D4030] transition-colors flex items-center gap-2">
                Our Collections <ChevronRight size={16} />
              </button>
            </Link>
            <Link href="/deals">
              <button className="border border-[#6F4E37] text-[#6F4E37] px-8 py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-[#6F4E37] hover:text-white transition-colors flex items-center gap-2">
                Our Deals <ChevronRight size={16} />
              </button>
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 relative flex items-center justify-center p-8 lg:p-0">
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#EBE0D8]/50 to-[#FDF8F5] rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#DFA048]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#6F4E37]/5 rounded-full blur-2xl"></div>

          {/* Main Hero Image */}
          <div className="relative z-0 w-full scale-110 lg:scale-150 transform transition-transform duration-700 ease-out">
            <img
              src="/images/hero.png"
              alt="Luxury Perfume"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-[#4A3B32] text-[#E8D4C5] py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Truck,
              title: "Express Delivery",
              desc: "Delivered within days",
            },
            {
              icon: ShieldCheck,
              title: "Satisfaction Guarantee",
              desc: "Guaranteed money-back policy",
            },
            {
              icon: Headset,
              title: "24/7 Assistance",
              desc: "Always-on customer support",
            },
            {
              icon: CreditCard,
              title: "Flexible Payments",
              desc: "Secure and easy payment options",
            },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <feature.icon size={32} strokeWidth={1.5} />
              <div>
                <h4 className="font-serif text-lg">{feature.title}</h4>
                <p className="text-sm opacity-70">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Collections */}
      <CuratedCollections products={collectionProducts} />

      <Promotional />

      {/*  Latest Collections */}
      <section className="container mx-auto px-4 py-20 text-center bg-[#FCFCFB]">
        <h2 className="text-4xl font-serif mb-16 text-[#4A3B32]">
          Latest Collections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {latestProducts.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <Testinomials />

      {/* Newsletter */}
      <NewsLetter />

      {/* Footer */}
      <Footer settings={settings} />
    </div>
  );
};

export default PerfumeShopTemplate;
