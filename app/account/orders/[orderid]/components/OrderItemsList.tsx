import React from "react";
import { Package } from "lucide-react";
import Currency from "@/components/common/Currency";
import { getMediaUrl } from "@/utils/media_url";

interface OrderItem {
  id: string;
  image?: string;
  title: string;
  price: number;
  quantity: number;
  options?: Array<{ name: string; value: string }>;
}

interface OrderItemsListProps {
  items: OrderItem[];
}

export const OrderItemsList = ({ items }: OrderItemsListProps) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 font-medium flex items-center gap-2">
        <Package size={18} className="text-gray-500" /> Items ({items.length})
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex gap-4">
            <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 shrink-0 overflow-hidden">
              {item.image ? (
                <img
                  src={getMediaUrl(item.image)}
                  alt={item.title}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No Img
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <span className="font-semibold">
                  <Currency value={item.price * item.quantity} />
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Qty: {item.quantity} × <Currency value={item.price} />
              </div>
              {item.options && Array.isArray(item.options) && (
                <div className="flex flex-wrap gap-2">
                  {item.options.map((opt, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600"
                    >
                      {opt.name}: {opt.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
