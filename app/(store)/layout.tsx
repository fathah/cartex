import React from "react";

export const dynamic = "force-dynamic";
import StoreHeader from "@/components/store/header";
import StoreFooter from "@/components/store/footer";
import CartDrawer from "@/components/store/CartDrawer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StoreHeader />
      <main className="grow">
        {children}
        <CartDrawer />
      </main>
      <StoreFooter />
    </div>
  );
}
