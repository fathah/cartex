"use client";

import React from "react";
import {
  Truck,
  ShieldCheck,
  Headset,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Zap,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Button } from "antd";
import ProductCard from "@/components/store/ProductCard";
import { AppConstants } from "@/constants/constants";
import Footer from "./Footer";

interface CommonHomeProps {
  products?: any[];
  featuredProducts?: any[];
  settings?: any;
}

const CommonHome: React.FC<CommonHomeProps> = ({
  products = [],
  featuredProducts = [],
  settings,
}) => {
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-[#f9fafb] overflow-hidden">
        {/* Background blobs for modern look */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold tracking-wide animate-fade-in">
              <Zap size={16} fill="currentColor" />
              <span>New Arrivals are here</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-500">
                Lifestyle Today.
              </span>
            </h1>

            <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover our curated collection of premium products designed to
              bring comfort, style, and innovation into your daily life.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
              <Link href="/new">
                <Button
                  type="primary"
                  size="large"
                  className="h-16 px-10 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-700 border-none shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                  Shop Collection <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="/deals">
                <Button
                  size="large"
                  className="h-16 px-10 rounded-2xl text-lg font-bold border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2"
                >
                  View Deals
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 text-gray-400">
              <div className="flex flex-col items-center lg:items-start text-sm">
                <span className="text-gray-900 font-bold text-xl">10k+</span>
                <span>Satisfied Customers</span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="flex flex-col items-center lg:items-start text-sm">
                <span className="text-gray-900 font-bold text-xl">4.9/5</span>
                <div className="flex text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Feature Product"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
            </div>

            {/* Floating elements */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl animate-bounce-slow hidden md:block">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                    Fast Shipping
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Delivery in 2 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "On all orders over $99",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: ShieldCheck,
                title: "Secure Payment",
                desc: "100% secure payment processing",
                color: "bg-green-50 text-green-600",
              },
              {
                icon: Headset,
                title: "24/7 Support",
                desc: "Dedicated support anytime",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: CreditCard,
                title: "Money Back",
                desc: "30-day money back guarantee",
                color: "bg-orange-50 text-orange-600",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center space-y-4 hover:translate-y-[-5px] transition-transform duration-300"
              >
                <div className={`p-4 rounded-2xl ${feature.color}`}>
                  <feature.icon size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  {feature.title}
                </h4>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-32 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                Featured Collections
              </h2>
              <p className="text-gray-500 text-lg">
                Explore our hand-picked selection of top-rated products that our
                customers love the most.
              </p>
            </div>
            <Link
              href="/products"
              className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-4 transition-all"
            >
              Browse All Products <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-20 container mx-auto px-6">
        <div className="bg-indigo-600 rounded-[40px] p-12 md:p-24 relative overflow-hidden dark">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <span className="uppercase tracking-[0.3em] font-bold text-indigo-200 text-sm">
                Special Offer
              </span>
              <h2 className="text-4xl md:text-6xl font-black">
                Get 20% Off Your <br /> First Order
              </h2>
              <p className="text-indigo-100 text-lg opacity-80 max-w-md">
                Sign up for our newsletter and get an exclusive discount on your
                next purchase. Don't miss out on these savings!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-16 px-8 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-auto min-w-[300px]"
                />
                <Button className="h-16 px-10 rounded-2xl bg-white text-indigo-600 border-none font-bold text-lg hover:bg-gray-100 transition-colors">
                  Subscribe
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative text-center">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-110"></div>
                <ShoppingBag
                  size={240}
                  className="text-white relative z-10 opacity-90 mx-auto"
                  strokeWidth={0.5}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />

      {/* Modern Style Tag */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CommonHome;
