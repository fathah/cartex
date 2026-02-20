"use client";

import { useCartStore } from "@/lib/store/cart";
import { Drawer, Button } from "antd";
import CartList from "./cart-list";
import Link from "next/link";
import { useEffect, useState } from "react";
import Currency from "../common/Currency";

export default function CartDrawer() {
  const { isOpen, closeCart, items, getTotalItems } = useCartStore();
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
    <Drawer
      title={`Your Cart (${getTotalItems()})`}
      onClose={closeCart}
      open={isOpen}
      width={450}
      footer={
        items.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Subtotal</span>
              <Currency value={subtotal} />
            </div>
            <p className="text-gray-500 text-xs text-center">
              Shipping & taxes calculated at checkout
            </p>
            <Link href="/checkout" onClick={closeCart}>
              <Button
                type="primary"
                size="large"
                block
                className="bg-[#003d29] hover:bg-[#002a1c] h-12"
              >
                Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={closeCart}>
              <Button block size="large" className="h-12">
                View Cart Page
              </Button>
            </Link>
          </div>
        )
      }
    >
      <CartList />
    </Drawer>
  );
}
