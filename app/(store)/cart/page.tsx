"use client";

import CartList from "@/components/store/CartList";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import Currency from "@/components/common/Currency";

const CartPage = () => {
  const { items, getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <div className="container mx-auto px-10 py-12 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <CartList />
        </div>

        {items.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>

              <div className="flex justify-between mb-4 text-gray-600">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span className="font-medium text-black">
                  <Currency value={subtotal} />
                </span>
              </div>

              <div className="flex justify-between mb-6 text-gray-600">
                <span>Shipping</span>
                <span className="text-sm">Calculated at checkout</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span>
                    <Currency value={subtotal} />
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button
                  type="primary"
                  size="large"
                  block
                  className="bg-[#003d29] hover:bg-[#002a1c] h-12 text-lg"
                >
                  Checkout
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <Link
                  href="/store"
                  className="text-sm text-gray-500 hover:text-black hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
