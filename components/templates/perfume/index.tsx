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

interface PerfumeShopProps {
  products?: any[];
  settings?: any;
}

const PerfumeShopTemplate: React.FC<PerfumeShopProps> = ({
  products = [],
  settings,
}) => {
  // Fallback or subset of products for different sections
  const featuredProducts = products.slice(0, 4);
  const collectionProducts = products.slice(0, 4); // Ideally different, but safely slicing

  return (
    <div className="bg-[#FDF8F5] min-h-screen  text-[#4A3B32]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 lg:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 overflow-hidden">
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <span className="inline-block px-3 py-1 bg-[#E8D4C5] text-[#8B5E3C] text-xs font-bold tracking-wider uppercase rounded-sm">
            Luxury & Premium
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-[#4A3B32] font-black leading-tight">
            Revel The Beauty <br className="hidden md:block" /> Inside You
          </h1>
          <p className="text-[#6D5D52] text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Timeless Fragrances, Crafted With Passion, Embody Individuality,
            Elegance, And Sophistication, Leaving A Lasting Impression Always.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
            <Link href="/collections">
              <button className="bg-[#6F4E37] text-white px-8 py-4 uppercase tracking-widest text-sm hover:bg-[#5D4030] transition-colors flex items-center gap-2">
                Our Collections <ChevronRight size={16} />
              </button>
            </Link>
            <Link href="/store">
              <button className="border border-[#6F4E37] text-[#6F4E37] px-8 py-4 uppercase tracking-widest text-sm hover:bg-[#6F4E37] hover:text-white transition-colors flex items-center gap-2">
                Our Combo <ChevronRight size={16} />
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
              title: "Free Delivery",
              desc: "No cost shipping worldwide",
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
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-serif mb-12 relative inline-block">
          Curated Collections
          <span className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#E8D4C5]/30 rounded-full blur-xl"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
          {collectionProducts.length > 0 ? (
            collectionProducts.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 italic">
              Add products to see collections
            </div>
          )}
        </div>

        <div className="mt-12">
          <Link href="/collections">
            <button className="bg-[#6F4E37] text-white px-8 py-3 uppercase text-xs tracking-widest hover:bg-[#5D4030] transition-colors">
              View Full Collection
            </button>
          </Link>
        </div>
      </section>

      {/* Promotional - Body Perfume */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/3 space-y-6">
            <h2 className="text-4xl font-serif">Body Perfume</h2>
            <p className="text-[#6D5D52] leading-relaxed">
              Explore Our Handpicked Selection Of Perfumes And Scented.
            </p>
            <button className="bg-[#6F4E37] text-white px-6 py-3 uppercase text-xs tracking-widest hover:bg-[#5D4030] transition-colors">
              Explore More
            </button>
          </div>
          <div className="md:w-2/3 h-80 md:h-[500px] w-full relative overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=2000"
              alt="Body Perfume"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/50 hover:scale-110 transition-transform">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fragrance Favourites */}
      <section className="container mx-auto px-4 py-20 text-center bg-[#FCFCFB]">
        <h2 className="text-4xl font-serif mb-16 text-[#4A3B32]">
          Fragrance Favourites
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {featuredProducts.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-[#FDF8F5] py-20 text-center">
        <div className="flex justify-center gap-1 text-[#DFA048] mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <blockquote className="max-w-2xl mx-auto text-xl font-serif leading-relaxed text-[#4A3B32] px-4">
          "I Absolutely Love The Products I Purchased From This Boutique. The
          Quality Is Exceptional, And My Skin Has Never Looked Better. The
          Beautiful Packaging Makes Each Use Feel Luxurious."
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            className="w-10 h-10 rounded-full grayscale"
            alt="User"
          />
          <div className="text-left">
            <div className="text-sm font-bold">Cody Fisher</div>
            <div className="text-xs text-gray-500">New York, USA</div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative h-96">
        <img
          src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover"
          alt="Newsletter Background"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4">
          <div className="bg-[#FDF8F5] p-6 md:p-12 max-w-2xl w-full text-center shadow-2xl mx-4">
            <h2 className="text-3xl font-serif mb-4 text-[#4A3B32]">
              Subscribe Now
            </h2>
            <p className="text-[#6D5D52] mb-8 text-sm">
              Refresh Your Senses With Exclusive Fragrances, Product Launches,
              And Special Offers Delivered To Your Inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email here"
                className="flex-1 border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#6F4E37]"
              />
              <button className="bg-[#4A3B32] text-white px-6 py-3 text-xs uppercase hover:bg-[#2d241e] transition-colors">
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FDF8F5] pt-20 pb-10 border-t border-[#E8D4C5]">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-[#6D5D52] text-sm">
          <div>
            <h4 className="text-[#4A3B32] font-serif uppercase tracking-widest mb-6">
              Serenique
            </h4>
            <p className="leading-relaxed mb-4">
              Refresh Your Senses With Exclusive Fragrances, Product Launches,
              And Special Offers.
            </p>
            <p>© 2026 SERENIQUE. All Rights Reserved.</p>
          </div>
          <div>
            <h4 className="text-[#4A3B32] font-serif uppercase tracking-widest mb-6">
              Shop
            </h4>
            <ul className="space-y-3">
              <li className="hover:text-[#4A3B32] cursor-pointer">
                Accessories
              </li>
              <li className="hover:text-[#4A3B32] cursor-pointer">Gifts</li>
              <li className="hover:text-[#4A3B32] cursor-pointer">Candles</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#4A3B32] font-serif uppercase tracking-widest mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              <li className="hover:text-[#4A3B32] cursor-pointer">About</li>
              <li className="hover:text-[#4A3B32] cursor-pointer">Journal</li>
              <li className="hover:text-[#4A3B32] cursor-pointer">Careers</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#4A3B32] font-serif uppercase tracking-widest mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              <li className="hover:text-[#4A3B32] cursor-pointer">FAQs</li>
              <li className="hover:text-[#4A3B32] cursor-pointer">Shipping</li>
              <li className="hover:text-[#4A3B32] cursor-pointer">Returns</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PerfumeShopTemplate;
