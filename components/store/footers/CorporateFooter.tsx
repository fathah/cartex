import React from "react";
import Link from "next/link";
import { Youtube, Instagram, Twitter, Facebook } from "lucide-react";

export default function CorporateFooter({ configs }: { configs: any }) {
  const bgColor = configs.backgroundColor || "#111827";
  const textColor =
    configs.textColor || (isDark(bgColor) ? "#f3f4f6" : "#111827");

  return (
    <footer
      style={{ backgroundColor: bgColor, color: textColor }}
      className="py-24 border-t border-gray-100"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-20 text-center md:text-left">
          <div className="col-span-1 md:col-span-4 space-y-8">
            <div className="text-3xl font-black tracking-tight uppercase">
              CARTEX
            </div>
            <p className="text-sm opacity-60 leading-relaxed max-w-sm mx-auto md:mx-0">
              Redefining the digital shopping experience through innovation and
              beautiful design. Your global partner in premium retail.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <Link
                href="#"
                className="p-2 border border-current/20 rounded-full hover:bg-current hover:text-black transition-all"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="#"
                className="p-2 border border-current/20 rounded-full hover:bg-current hover:text-black transition-all"
              >
                <Youtube size={18} />
              </Link>
              <Link
                href="#"
                className="p-2 border border-current/20 rounded-full hover:bg-current hover:text-black transition-all"
              >
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          <div className="col-span-1 md:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-12">
            {configs.columns?.map((col: any, i: number) => (
              <div key={i} className="space-y-6">
                <h4 className="font-bold uppercase tracking-widest text-sm opacity-90">
                  {col.title}
                </h4>
                <ul className="space-y-4 text-sm opacity-60 font-medium">
                  {col.links?.map((link: any, j: number) => (
                    <li key={j}>
                      <Link
                        href={link.url}
                        className="hover:opacity-100 hover:translate-x-1 inline-block transition-all"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-10 border-t border-current/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs opacity-50 uppercase tracking-[0.1em] font-semibold">
          <div>
            &copy; {new Date().getFullYear()} Cartex Pro. Inc. All rights
            reserved.
          </div>
          <div className="flex gap-8">
            <Link
              href="/privacy"
              className="hover:opacity-100 transition-opacity"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:opacity-100 transition-opacity"
            >
              Terms of Use
            </Link>
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
