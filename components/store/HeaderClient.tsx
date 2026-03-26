"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  Menu,
  Package,
  Heart,
  MapPin,
  Wallet,
} from "lucide-react";
import { Badge, Dropdown, MenuProps, Drawer } from "antd";
import { useCartStore } from "@/lib/store/cart";
import { AppConstants } from "@/constants/constants";
import SearchOverlay from "./SearchOverlay";

export default function HeaderClient({
  settings,
  categories,
}: {
  settings: any;
  categories: any[];
}) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const categoryItems: MenuProps["items"] = categories.map((cat) => ({
    key: cat.id,
    label: <Link href={`/categories/${cat.slug}`}>{cat.name}</Link>,
  }));

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4 lg:gap-8">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-32 lg:w-36 object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-emerald-950 tracking-tight">
                  {settings.storeName || AppConstants.SHOP_NAME}
                </span>
              </div>
            )}
          </Link>
        </div>

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
            {/* <Link
              href="/delivery"
              className="hover:text-emerald-700 transition-colors"
            >
              Delivery
            </Link> */}
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
        </div>

        {/* Mobile Search Icon */}
        <div className="flex items-center lg:hidden ml-auto">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Search size={22} />
          </button>
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

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <Drawer
        title={<span className="font-bold text-gray-800">Menu</span>}
        placement="left"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        className="lg:hidden"
        size={"default"}
      >
        <div className="flex flex-col gap-6 font-medium text-lg text-gray-700">
          <Link
            href="/deals"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-emerald-700"
          >
            Deals
          </Link>
          <Link
            href="/new"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-emerald-700"
          >
            What&prime;s New
          </Link>
          <Link
            href="/categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-emerald-700"
          >
            Categories
          </Link>

          <div className="h-px bg-gray-100 my-2" />

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              My Account
            </h3>
            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 hover:text-emerald-700"
            >
              <User size={18} /> Profile
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 hover:text-emerald-700"
            >
              <Package size={18} /> Orders
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 hover:text-emerald-700"
            >
              <Heart size={18} /> Wishlist
            </Link>
            <Link
              href="/account/addresses"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 hover:text-emerald-700"
            >
              <MapPin size={18} /> Addresses
            </Link>
            {/* <Link
              href="/account/payments"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 hover:text-emerald-700"
            >
              <Wallet size={18} /> Payments
            </Link> */}
          </div>
        </div>
      </Drawer>
    </header>
  );
}
