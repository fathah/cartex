"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { getOrder } from "@/actions/orders";
import {
  Loader2,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Currency from "@/components/common/Currency";
import Link from "next/link";
// Confetti removed as it is not implemented
import { getMediaUrl } from "@/utils/media_url";

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params?.orderid) return;
      try {
        // Ensure orderid is a string (useParams can return string | string[])
        const id = Array.isArray(params.orderid)
          ? params.orderid[0]
          : params.orderid;
        const data = await getOrder(id);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params?.orderid]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const { status, paymentStatus, fulfillmentStatus, items, paymentMethod } =
    order;

  const StatusBadge = ({
    status,
    type,
  }: {
    status: string;
    type: "order" | "payment" | "fulfill";
  }) => {
    let color = "bg-gray-100 text-gray-600";
    if (["PAID", "FULFILLED", "SUCCESS"].includes(status))
      color = "bg-green-100 text-green-700";
    if (["PENDING", "PROCESSING"].includes(status))
      color = "bg-amber-100 text-amber-700";
    if (["FAILED", "CANCELLED"].includes(status))
      color = "bg-red-100 text-red-700";

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Banner */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-green-100 p-2 rounded-full text-green-600 shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-green-800 mb-1">
              Order Placed Successfully!
            </h2>
            <p className="text-green-700">
              Thank you for your purchase. Your order #
              {order.orderNumber || order.id.slice(-6).toUpperCase()} has been
              confirmed.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/account/orders"
              className="text-gray-400 hover:text-black"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">
              Order #{order.orderNumber || order.id.slice(-6).toUpperCase()}
            </h1>
            <StatusBadge status={status} type="order" />
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <Calendar size={14} />
            {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </div>
        </div>
        {/* Actions could go here (Download Invoice etc) */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content: Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 font-medium flex items-center gap-2">
              <Package size={18} className="text-gray-500" /> Items (
              {items.length})
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item: any) => (
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
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <span className="font-semibold">
                        <Currency value={item.price * item.quantity} />
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Qty: {item.quantity} × <Currency value={item.price} />
                    </div>
                    {item.options && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.options).map(
                          ([key, value]: any) => (
                            <span
                              key={key}
                              className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600"
                            >
                              {key}: {value}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Summary & Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm p-6">
            <h3 className="font-bold mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  <Currency value={order.subtotal} />
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  <Currency value={order.shippingTotal} />
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>
                  <Currency value={order.taxTotal} />
                </span>
              </div>

              {/* Assuming hidden fee field on Order model or calculated. 
                                Since schema doesn't have explicit 'feeTotal', checking logic.
                                Total = Sub + Ship + Tax + Fee.
                                Fee = Total - (Sub + Ship + Tax).
                            */}
              {order.totalPrice -
                (order.subtotal + order.shippingTotal + order.taxTotal) >
                0.01 && (
                <div className="flex justify-between text-gray-600">
                  <span>Payment Fee</span>
                  <span>
                    <Currency
                      value={
                        order.totalPrice -
                        (order.subtotal + order.shippingTotal + order.taxTotal)
                      }
                    />
                  </span>
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  <Currency value={order.totalPrice} />
                </span>
              </div>
            </div>
          </div>

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
            {/* Address would go here if available */}
          </div>
        </div>
      </div>
    </div>
  );
}
