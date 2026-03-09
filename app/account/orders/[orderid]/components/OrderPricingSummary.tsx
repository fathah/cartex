import React from "react";
import Currency from "@/components/common/Currency";

interface OrderPricingSummaryProps {
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  totalPrice: number;
}

export const OrderPricingSummary = ({
  subtotal,
  shippingTotal,
  taxTotal,
  totalPrice,
}: OrderPricingSummaryProps) => {
  const paymentFee = totalPrice - (subtotal + shippingTotal + taxTotal);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm p-6">
      <h3 className="font-bold mb-4">Summary</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>
            <Currency value={subtotal} />
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            <Currency value={shippingTotal} />
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>
            <Currency value={taxTotal} />
          </span>
        </div>

        {paymentFee > 0.01 && (
          <div className="flex justify-between text-gray-600">
            <span>Payment Fee</span>
            <span>
              <Currency value={paymentFee} />
            </span>
          </div>
        )}

        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>
            <Currency value={totalPrice} />
          </span>
        </div>
      </div>
    </div>
  );
};
