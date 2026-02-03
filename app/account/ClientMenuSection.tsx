"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  RotateCcw,
  Heart,
  User,
  MapPin,
  Wallet,
  LucideIcon,
} from "lucide-react";

interface MenuItem {
  iconName: string;
  label: string;
  href: string;
  badge?: string;
}

interface ClientMenuSectionProps {
  items: MenuItem[];
}

// Map icon names to actual icon components
const iconMap: Record<string, LucideIcon> = {
  Package,
  RotateCcw,
  Heart,
  User,
  MapPin,
  Wallet,
};

export default function ClientMenuSection({ items }: ClientMenuSectionProps) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = iconMap[item.iconName];

        return (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${isActive ? "bg-yellow-50 border-l-4 border-yellow-400" : "border-l-4 border-transparent"}`}
            >
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <IconComponent
                    size={20}
                    className={isActive ? "text-black" : "text-gray-500"}
                  />
                )}
                <span
                  className={`text-sm font-medium ${isActive ? "text-black" : "text-gray-700"}`}
                >
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className="text-xs text-gray-400">{item.badge}</span>
              )}
            </div>
          </Link>
        );
      })}
    </>
  );
}
