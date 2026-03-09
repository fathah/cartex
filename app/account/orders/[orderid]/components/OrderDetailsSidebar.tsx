import React from "react";
import { CreditCard, Truck } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface OrderDetailsSidebarProps {
  paymentMethod: string;
  paymentStatus: string;
  fulfillmentStatus: string;
}

export const OrderDetailsSidebar = ({
  paymentMethod,
  paymentStatus,
  fulfillmentStatus,
}: OrderDetailsSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Payment Info */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-gray-500" /> Payment
        </h3>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Method</span>
            <span className="font-medium">{paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <StatusBadge status={paymentStatus} type="payment" />
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Truck size={18} className="text-gray-500" /> Fulfillment
        </h3>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <StatusBadge status={fulfillmentStatus} type="fulfill" />
          </div>
        </div>
      </div>
    </div>
  );
};
