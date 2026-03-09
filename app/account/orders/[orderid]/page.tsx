"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { getOrder } from "@/actions/orders";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

import { OrderHeader } from "./components/OrderHeader";
import { OrderProgress } from "./components/OrderProgress";
import { OrderItemsList } from "./components/OrderItemsList";
import { OrderPricingSummary } from "./components/OrderPricingSummary";
import { OrderDetailsSidebar } from "./components/OrderDetailsSidebar";

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
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

      <OrderHeader
        orderNumber={order.orderNumber}
        orderId={order.id}
        status={order.status}
        createdAt={order.createdAt}
      />

      <OrderProgress
        status={order.status}
        fulfillmentStatus={order.fulfillmentStatus}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <OrderItemsList items={order.items} />
        </div>

        <div className="space-y-6">
          <OrderPricingSummary
            subtotal={order.subtotal}
            shippingTotal={order.shippingTotal}
            taxTotal={order.taxTotal}
            totalPrice={order.totalPrice}
          />

          <OrderDetailsSidebar
            paymentMethod={order.paymentMethod}
            paymentStatus={order.paymentStatus}
            fulfillmentStatus={order.fulfillmentStatus}
          />
        </div>
      </div>
    </div>
  );
}
