"use client";

import Link from "next/link";
import { ArrowUp, Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

interface FooterProps {
  settings?: any;
}

export default function Footer({ settings }: FooterProps) {
  const storeName = settings?.storeName || "SERENIQUE";
  const storeDescription =
    settings?.storeDescription ||
    "Empowering you with timeless fragrances and curated collections to improve your daily self-expression and confidence.";
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#FDF8F5] px-4 pb-4 pt-10">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-[#2d241e] rounded-4xl overflow-hidden relative shadow-2xl flex flex-col">
          {/* Decorative background vector lines imitating the reference image */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.05]">
            <svg
              className="absolute w-full h-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="xMidYMid slice"
            >
              <path
                d="M 500 1200 L 1200 100 L 1900 1200"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M -200 1200 L 500 100 L 1200 1200"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="p-10 lg:p-16 flex flex-col lg:flex-row gap-16 relative z-10 text-white/80 flex-1">
            {/* Left Column - Brand & Info */}
            <div className="flex flex-col justify-between flex-1 space-y-12">
              <div className="space-y-6">
                <Link href="/" className="flex items-center gap-3">
                  {/* Dynamic Logo Marker */}
                  <div className="w-8 h-8 rounded-sm bg-[#DFA048] flex items-center justify-center text-[#2d241e] font-bold text-xl leading-none">
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-2xl font-serif text-white tracking-widest uppercase">
                    {storeName}
                  </h3>
                </Link>

                <p className="leading-relaxed max-w-md text-sm md:text-base">
                  {storeDescription}
                </p>
              </div>

              <div className="space-y-8">
                {/* Socials */}
                <div className="flex gap-6">
                  <Link href="#" className="hover:text-white transition-colors">
                    <Twitter size={20} strokeWidth={1.5} />
                  </Link>
                  <Link href="#" className="hover:text-white transition-colors">
                    <Linkedin size={20} strokeWidth={1.5} />
                  </Link>
                  <Link href="#" className="hover:text-white transition-colors">
                    <Instagram size={20} strokeWidth={1.5} />
                  </Link>
                  <Link href="#" className="hover:text-white transition-colors">
                    <Facebook size={20} strokeWidth={1.5} />
                  </Link>
                </div>

                {/* Back to top button */}
                <button
                  onClick={scrollToTop}
                  className="flex items-center gap-2 border border-white/20 hover:bg-white/10 px-6 py-3 text-xs uppercase tracking-widest transition-colors font-semibold w-max"
                >
                  <ArrowUp size={16} />
                  Back to top
                </button>
              </div>
            </div>

            {/* Right Side Links */}
            <div className="flex flex-col sm:flex-row gap-12 sm:gap-24 lg:w-1/2 pt-2">
              <div className="space-y-6">
                <h4 className="text-white font-medium text-sm">Site Map</h4>
                <ul className="space-y-4 text-xs tracking-wide">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4"
                    >
                      Homepage
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/store"
                      className="hover:text-white transition-colors"
                    >
                      Store
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="hover:text-white transition-colors text-white/60"
                    >
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/deals"
                      className="hover:text-white transition-colors text-white/60"
                    >
                      Special Deals
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-white transition-colors text-white/60"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-white transition-colors text-white/60"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-medium text-sm">Legal</h4>
                <ul className="space-y-4 text-xs tracking-wide text-white/60">
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-white transition-colors"
                    >
                      Terms of Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/returns"
                      className="hover:text-white transition-colors"
                    >
                      Returns & Refunds
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-[#DFA048] text-[#2d241e] text-center py-4 text-xs font-semibold relative z-10 w-full mt-auto">
            Copyright &copy; {currentYear}, Cartex Pro, All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
