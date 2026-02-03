"use client";

import { useState } from "react";
import CheckoutForm from "./comps/checkout-form";
import OrderSummary from "./comps/order-summary";

interface CheckoutPageClientProps {
  customer: any;
  addresses: any[];
}

export default function CheckoutPageClient({
  customer,
  addresses,
}: CheckoutPageClientProps) {
  const [shippingCost, setShippingCost] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Form */}
      <div className="lg:col-span-8">
        <CheckoutForm
          customer={customer}
          addresses={addresses}
          onShippingCostChange={setShippingCost}
        />
      </div>

      {/* Right Column: Summary */}
      <div className="lg:col-span-4">
        <OrderSummary shippingCost={shippingCost} />
      </div>
    </div>
  );
}
