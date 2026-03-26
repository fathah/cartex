import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Info, Shield } from "lucide-react";

export default function GridFooter({ configs }: { configs: any }) {
  const bgColor = configs.backgroundColor || "#f9fafb";
  const textColor =
    configs.textColor || (isDark(bgColor) ? "#ffffff" : "#374151");
  const primaryColor = configs.primaryColor || "#4f46e5";

  return (
    <footer
      style={{ backgroundColor: bgColor, color: textColor }}
      className="py-20 border-t border-gray-100 font-sans"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3 space-y-8">
            <div className="text-3xl font-serif text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full text-xl">
                C
              </div>
              CARTEX
            </div>
            <p className="opacity-70 text-lg leading-relaxed italic">
              "Design is not just what it looks like and feels like. Design is
              how it works."
            </p>
            <div className="pt-4">
              <button
                style={{ backgroundColor: primaryColor }}
                className="px-8 py-4 text-white rounded-full font-bold flex items-center gap-3 hover:opacity-90 transition-all shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1"
              >
                Explore Shop <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-24">
            {configs.columns?.map((col: any, i: number) => (
              <div key={i} className="space-y-10">
                <h4 className="text-xl font-bold flex items-center gap-3">
                  {i === 0 ? (
                    <ShoppingBag size={24} className="opacity-50" />
                  ) : (
                    <Info size={24} className="opacity-50" />
                  )}
                  {col.title}
                </h4>
                <ul className="space-y-6 text-gray-500 font-medium">
                  {col.links?.map((link: any, j: number) => (
                    <li key={j}>
                      <Link
                        href={link.url}
                        className="hover:text-black transition-colors flex items-center group"
                      >
                        <span className="w-0 group-hover:w-4 transition-all duration-300 h-px bg-current mr-0 group-hover:mr-2"></span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6 text-sm opacity-60">
          <div className="flex items-center gap-2">
            <Shield size={16} /> Secure Shopping & Privacy Protected
          </div>
          <div>
            &copy; {new Date().getFullYear()} Cartex Pro. Crafted with passion.
          </div>
        </div>
      </div>
    </footer>
  );
}

function isDark(color: string) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
