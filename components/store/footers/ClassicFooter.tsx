import React from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export default function ClassicFooter({ configs }: { configs: any }) {
  const bgColor = configs.backgroundColor || "#ffffff";
  const textColor =
    configs.textColor || (isDark(bgColor) ? "#ffffff" : "#111827");
  const borderColor = configs.borderColor || "#e5e7eb";

  return (
    <footer
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderTopColor: borderColor,
      }}
      className="py-16 border-t font-serif"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold italic tracking-tight">
              CARTEX PRO
            </h2>
            <div className="flex flex-wrap gap-x-12 gap-y-6 text-lg font-medium">
              {configs.links?.map((link: any, i: number) => (
                <Link
                  key={i}
                  href={link.url}
                  className="hover:underline underline-offset-8"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-sm opacity-50 font-sans max-w-sm tracking-wide">
              Established in 2024. Providing timeless products and unmatched
              quality. We are committed to your absolute satisfaction.
            </p>
          </div>

          {configs.showNewsletter && (
            <div className="bg-gray-50 p-10 md:p-16 rounded-3xl space-y-8 border-[0.5px] border-gray-200 shadow-sm text-black">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold flex items-center gap-3 font-sans">
                  <Mail size={24} strokeWidth={1.5} /> Stay in the loop
                </h3>
                <p className="text-sm opacity-60 font-sans">
                  Join our list and receive early access to new collections and
                  exclusive discounts.
                </p>
              </div>
              <div className="flex bg-white p-2 rounded-2xl shadow-inner border border-gray-100">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-sans"
                />
                <button className="bg-black text-white px-8 py-3 rounded-xl font-bold font-sans hover:bg-gray-800 transition-colors flex items-center gap-2">
                  Join <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-24 pt-12 border-t border-current/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.3em] font-sans opacity-40 font-black">
          <div>
            &copy; {new Date().getFullYear()} Cartex Pro. World Class Standard.
          </div>
          <div className="flex gap-12">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Cookies</Link>
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
