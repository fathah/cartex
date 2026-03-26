"use client";

import { MapPin, Truck, CreditCard, Package, Edit2 } from "lucide-react";
import Currency from "@/components/common/Currency";
import { getMediaUrl } from "@/utils/media_url";
import { getCheckoutPaymentMethodLabel } from "@/lib/payment-methods";

interface OrderReviewProps {
  items: any[];
  selectedAddress: any;
  shippingMethodName: string;
  shippingCost: number;
  paymentMethodCode: string;
  paymentFee: number;
  paymentFeeLabel: string;
  onGoBack: () => void;
  onChangeAddress: () => void;
  onChangeShipping: () => void;
  onChangePayment: () => void;
}

export default function OrderReview({
  items,
  selectedAddress,
  shippingMethodName,
  shippingCost,
  paymentMethodCode,
  paymentFee,
  paymentFeeLabel,
  onGoBack,
  onChangeAddress,
  onChangeShipping,
  onChangePayment,
}: OrderReviewProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Review Your Order</h2>

      {/* Products */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
            <Package size={15} />
            Items ({items.length})
          </div>
          <button
            type="button"
            onClick={onChangeAddress}
            className="text-xs text-[#003d29] font-medium hover:underline cursor-pointer flex items-center gap-1"
          >
            <Edit2 size={11} /> Edit
          </button>
        </div>
        <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 p-4">
              <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 shrink-0 overflow-hidden">
                {item.image ? (
                  <img
                    src={getMediaUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 line-clamp-1">
                  {item.name}
                </div>
                {item.variantTitle && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.variantTitle}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Qty: {item.quantity}
                </div>
              </div>
              <div className="font-semibold text-sm text-gray-900 shrink-0">
                <Currency value={item.price * item.quantity} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address */}
      {selectedAddress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <MapPin size={15} />
              Delivery Address
            </div>
            <button
              type="button"
              onClick={onChangeAddress}
              className="text-xs text-[#003d29] font-medium hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 size={11} /> Change
            </button>
          </div>
          <div className="border border-gray-200 rounded-2xl p-4">
            <div className="font-semibold text-sm text-gray-900 mb-1">
              {selectedAddress.fullname}
            </div>
            <div className="text-sm text-gray-600">
              {selectedAddress.address1}
              {selectedAddress.address2 && `, ${selectedAddress.address2}`}
            </div>
            <div className="text-sm text-gray-600">
              {selectedAddress.city}, {selectedAddress.zip},{" "}
              {selectedAddress.country}
            </div>
            {selectedAddress.phone && (
              <div className="text-xs text-gray-400 mt-1">
                {selectedAddress.phone}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shipping Method */}
      {shippingMethodName && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <Truck size={15} />
              Shipping Method
            </div>
            <button
              type="button"
              onClick={onChangeShipping}
              className="text-xs text-[#003d29] font-medium hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 size={11} /> Change
            </button>
          </div>
          <div className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <Truck size={16} className="text-gray-500" />
              </div>
              <span className="font-medium text-sm text-gray-900">
                {shippingMethodName}
              </span>
            </div>
            <span className="font-semibold text-sm text-gray-900">
              {shippingCost === 0 ? (
                <span className="text-green-600">Free 🎉</span>
              ) : (
                <Currency value={shippingCost} />
              )}
            </span>
          </div>
        </div>
      )}

      {/* Payment Method */}
      {paymentMethodCode && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <CreditCard size={15} />
              Payment Method
            </div>
            <button
              type="button"
              onClick={onChangePayment}
              className="text-xs text-[#003d29] font-medium hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 size={11} /> Change
            </button>
          </div>
          <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <CreditCard size={16} className="text-gray-500" />
            </div>
            <span className="font-medium text-sm text-gray-900 capitalize">
              {getCheckoutPaymentMethodLabel(paymentMethodCode)}
            </span>
            {paymentFee > 0 && (
              <span className="text-xs text-amber-600 ml-auto">
                {paymentFeeLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Back navigation only — Place Order is in the summary sidebar */}
      <div className="flex mt-8">
        <button
          type="button"
          onClick={onGoBack}
          className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 h-12 rounded-xl font-semibold transition-all cursor-pointer"
        >
          Back
        </button>
      </div>
    </div>
  );
}
