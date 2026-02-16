"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, Search, ChevronDown } from "lucide-react";
import { Badge, Dropdown, MenuProps } from "antd";
import { useCartStore } from "@/lib/store/cart";
import { AppConstants } from "@/constants/constants";
import SearchOverlay from "./search-overlay";

export default function HeaderClient({
  settings,
  categories,
}: {
  settings: any;
  categories: any[];
}) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cartCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const categoryItems: MenuProps["items"] = categories.map((cat) => ({
    key: cat.id,
    label: <Link href={`/category/${cat.slug}`}>{cat.name}</Link>,
  }));

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.storeName}
              className="w-32 object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-emerald-800 p-1.5 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-emerald-950 tracking-tight">
                {settings.storeName || AppConstants.SHOP_NAME}
              </span>
            </div>
          )}
        </Link>

        {/* Navigation & Search Container */}
        <div className="hidden lg:flex items-center flex-1 gap-8">
          {/* Primary Nav */}
          <nav className="flex items-center gap-8 font-medium text-gray-700">
            <Dropdown menu={{ items: categoryItems }} placement="bottom" arrow>
              <button className="flex items-center gap-1 hover:text-emerald-700 transition-colors">
                Categories
                <ChevronDown size={14} />
              </button>
            </Dropdown>
            <Link
              href="/deals"
              className="hover:text-emerald-700 transition-colors"
            >
              Deals
            </Link>
            <Link
              href="/new"
              className="hover:text-emerald-700 transition-colors whitespace-nowrap"
            >
              What&prime;s New
            </Link>
            <Link
              href="/delivery"
              className="hover:text-emerald-700 transition-colors"
            >
              Delivery
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-auto">
            <div
              className="relative group cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
            >
              <div className="w-full h-11 pl-5 pr-12 rounded-full bg-gray-100 flex items-center text-sm text-gray-500 group-hover:bg-gray-50 group-hover:shadow-sm border border-transparent group-hover:border-gray-200 transition-all">
                Search Product...
              </div>
              <button className="absolute right-1 top-1 h-9 w-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all">
                <Search size={18} />
              </button>
            </div>
          </div>

          <SearchOverlay
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link
            href="/account"
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-emerald-800 transition-colors"
          >
            <User size={22} />
            <span className="hidden sm:inline">Account</span>
          </Link>

          <div
            onClick={() => useCartStore.getState().openCart()}
            className="flex items-center gap-2 font-medium text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer select-none"
          >
            <Badge
              count={mounted ? cartCount : 0}
              showZero
              offset={[0, -5]}
              color="#065f46"
            >
              <ShoppingCart size={22} />
            </Badge>
            <span className="hidden sm:inline">Cart</span>
          </div>
        </div>
      </div>
    </header>
  );
}
