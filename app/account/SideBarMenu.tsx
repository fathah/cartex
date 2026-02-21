"use client";

import Link from "next/link";
import { useUser } from "./UserContext";
import ClientMenuSection from "./ClientMenuSection";
import { useEffect, useState } from "react";
import { getWishlistCount } from "./wishlist/actions";

export default function SideBarMenu() {
  const { user } = useUser();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    // Fetch wishlist count on mount
    getWishlistCount().then(setWishlistCount);
  }, []);

  // Generate initials from name or email
  const getInitials = () => {
    if (user.fullname) {
      const parts = user.fullname.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.fullname.substring(0, 2).toUpperCase();
    } else if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Get display name
  const getDisplayName = () => {
    if (user.fullname) {
      return user.fullname;
    } else if (user.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const menuItems = [
    { iconName: "Package", label: "Orders", href: "/account/orders" },
    // { iconName: "RotateCcw", label: "Returns", href: "/account/returns" },
    {
      iconName: "Heart",
      label: "Wishlist",
      href: "/account/wishlist",
      badge:
        wishlistCount > 0
          ? `${wishlistCount} ${wishlistCount === 1 ? "item" : "items"}`
          : undefined,
    },
  ];

  const accountItems = [
    { iconName: "User", label: "Profile", href: "/account" },
    { iconName: "MapPin", label: "Addresses", href: "/account/addresses" },
    // { iconName: "Wallet", label: "Payments", href: "/account/payments" },
  ];

  const SidebarContent = (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-[#5d5d5d] rounded-full flex items-center justify-center text-white font-bold text-lg">
          {getInitials()}
        </div>
        <div className="overflow-hidden">
          <h3 className="font-bold text-gray-900 truncate">
            {getDisplayName()}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {user.email || user.phone || "No contact info"}
          </p>
        </div>
      </div>

      {/* Menu Section 1 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ClientMenuSection items={menuItems} />
      </div>

      {/* Menu Section 2 - My Account */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          My Account
        </div>
        <ClientMenuSection items={accountItems} />
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:block w-full lg:w-1/4">{SidebarContent}</aside>
  );
}
