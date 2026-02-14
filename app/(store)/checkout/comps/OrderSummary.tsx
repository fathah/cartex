"use client";

import { useCartStore } from "@/lib/store/cart";
import { Button, Input, Divider } from "antd";
import { useEffect, useState } from "react";
import Currency from "@/components/common/Currency";
import { getMediaUrl } from "@/utils/media_url";
import { Truck, CreditCard, Package } from "lucide-react";

interface OrderSummaryProps {
  shippingCost?: number;
  shippingMethodName?: string;
  paymentMethodCode?: string;
  paymentFee?: number;
  paymentFeeLabel?: string;
  onCompleteOrder?: () => void;
  loading?: boolean;
}

export default function OrderSummary({
  shippingCost = 0,
  shippingMethodName = "",
  paymentMethodCode = "",
  paymentFee = 0,
  paymentFeeLabel = "",
  onCompleteOrder,
  loading = false,
}: OrderSummaryProps) {
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
  const shipping = shippingCost;
  const taxes = subtotal * 0.05; // 5% tax

  // Use the passed paymentFee directly
  const appliedPaymentFee = paymentFee;
  const total = subtotal + shipping + taxes + appliedPaymentFee;

  const isDisabled = loading || !shippingMethodName || !paymentMethodCode;

  return (
    <div className="bg-gray-50 p-8 rounded-2xl sticky top-24">
      <h2 className="text-xl font-bold mb-6">Summary</h2>

      {/* Cart Items */}
      <div className="flex flex-col gap-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.key} className="flex gap-4">
            <div className="w-16 h-16 bg-white rounded-lg shrink-0 border border-gray-200 overflow-hidden relative">
              {item.image ? (
                <img
                  src={getMediaUrl(item.image)}
                  alt={item.name}
                  className="object-cover w-full h-full mix-blend-multiply"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                  No Img
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-sm line-clamp-2">
                  {item.name}
                </h3>
                <span className="font-semibold text-sm">
                  <Currency value={item.price * item.quantity} />
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {item.variantTitle && <span>{item.variantTitle}</span>}
                {item.variantTitle && <span className="mx-1">•</span>}
                <span>Qty: {item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Calculations */}
      <div className="flex flex-col gap-3 text-sm mb-6">
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1.5">
            <Package size={14} />
            Subtotal
          </span>
          <span>
            <Currency value={subtotal} />
          </span>
        </div>

        {/* Shipping with method name */}
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1.5">
            <Truck size={14} />
            {shippingMethodName || (
              <span className="text-amber-600">Select Method</span>
            )}
          </span>
          <span>
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">Free 🎉</span>
            ) : (
              <Currency value={shipping} />
            )}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Taxes (5%)</span>
          <span>
            <Currency value={taxes} />
          </span>
        </div>

        {/* Generic Payment Fee line */}
        {appliedPaymentFee > 0 && (
          <div className="flex justify-between text-amber-600">
            <span className="flex items-center gap-1.5">
              <CreditCard size={14} />
              {paymentFeeLabel || "Payment Fee"}
            </span>
            <span>
              +<Currency value={appliedPaymentFee} />
            </span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg text-black mt-2 pt-4 border-t border-gray-200">
          <span>Total</span>
          <span>
            <Currency value={total} />
          </span>
        </div>
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2">
          Do you have a promotional code?
        </p>
        <div className="flex gap-2">
          <Input placeholder="Enter code" size="large" className="rounded-lg" />
          <Button
            size="large"
            className="bg-black text-white px-6 hover:bg-gray-800! border-black rounded-lg"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* High-conversion CTA */}
      <button
        type="button"
        onClick={onCompleteOrder}
        disabled={isDisabled}
        className={`w-full bg-[#003d29] hover:bg-[#002a1c] text-white h-14 text-lg font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#003d29]/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
          ${isDisabled ? "opacity-50 cursor-not-allowed transform-none hover:shadow-none hover:bg-[#003d29]" : ""}
        `}
      >
        {loading ? (
          <>processing...</>
        ) : (
          <>
            Complete Order • <Currency value={total} className="font-bold" />
          </>
        )}
      </button>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">🔒 Secure Checkout</span>
        <span>•</span>
        <span className="flex items-center gap-1">📦 Easy Returns</span>
      </div>
    </div>
  );
}
