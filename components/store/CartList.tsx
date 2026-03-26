"use client";

import { useCartStore, CartItem } from "@/lib/store/cart";
import { Button, InputNumber, Empty } from "antd";
import { Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { AppConstants } from "@/constants/constants";
import Currency from "@/components/common/Currency";
import { getMediaUrl } from "@/utils/media_url";

export default function CartList() {
  const { items, updateQuantity, removeFromCart, closeCart } = useCartStore();
  const canUseDOM = typeof window !== "undefined";

  // To handle hydration mismatch for now, simple check
  if (!canUseDOM) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Empty description="Your cart is empty" />
        <Link href="/store" onClick={closeCart} className="mt-4">
          <Button type="primary">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex gap-4 border-b bg-gray-50 border-gray-100 px-6 py-2"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getMediaUrl(item.image)}
                alt={item.name}
                className="object-cover w-full h-full mix-blend-multiply"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                No Img
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <Link
                  href={`/product/${item.slug}`}
                  onClick={closeCart}
                  className="font-medium hover:text-black line-clamp-1"
                >
                  {item.name}
                </Link>
                <button
                  onClick={() => removeFromCart(item.key)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {item.variantTitle && (
                <p className="text-sm text-gray-500">{item.variantTitle}</p>
              )}
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md h-8">
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                    className="px-2 hover:bg-gray-50 h-full flex items-center"
                    disabled={item.quantity <= Math.max(1, item.minQuantity || 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 text-sm font-medium w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                    className="px-2 hover:bg-gray-50 h-full flex items-center"
                    disabled={
                      item.maxQuantity !== null &&
                      item.maxQuantity !== undefined &&
                      item.quantity >= item.maxQuantity
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {item.maxQuantity !== null && item.maxQuantity !== undefined && (
                  <span className="text-xs text-gray-400">
                    Max {item.maxQuantity}
                  </span>
                )}
              </div>
              <div className="font-semibold text-sm">
                <Currency value={item.price * item.quantity} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
