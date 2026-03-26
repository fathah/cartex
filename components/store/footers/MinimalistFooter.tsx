import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";

export default function MinimalistFooter({ configs }: { configs: any }) {
  const bgColor = configs.backgroundColor || "#ffffff";
  const textColor =
    configs.textColor || (isDark(bgColor) ? "#ffffff" : "#111827");

  return (
    <footer
      style={{ backgroundColor: bgColor, color: textColor }}
      className="py-20 border-t border-gray-100"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4 max-w-sm">
            {configs.showLogo && (
              <div className="text-2xl font-bold tracking-tighter uppercase italic">
                CARTEX
              </div>
            )}
            <p className="text-sm opacity-60 leading-relaxed">
              Timeless designs for the modern lifestyle. Curated with precision,
              delivered with care.
            </p>
          </div>

          <div className="flex gap-12 text-sm font-medium tracking-wide">
            {configs.links?.map((link: any, i: number) => (
              <Link
                key={i}
                href={link.url}
                className="hover:opacity-50 transition-opacity uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-6">
            {configs.socials?.instagram && (
              <Link
                href={configs.socials.instagram}
                className="hover:scale-110 transition-transform"
              >
                <Instagram size={20} strokeWidth={1.5} />
              </Link>
            )}
            {configs.socials?.twitter && (
              <Link
                href={configs.socials.twitter}
                className="hover:scale-110 transition-transform"
              >
                <Twitter size={20} strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-current/10 text-center text-xs opacity-40 uppercase tracking-[0.2em]">
          {configs.copyrightText}
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
