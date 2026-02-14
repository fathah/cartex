"use client";

import { useState } from "react";
import { Form, message } from "antd";
import { useRouter } from "next/navigation";
import CheckoutForm from "./comps/CheckoutForm";
import OrderSummary from "./comps/OrderSummary";
import { useCartStore } from "@/lib/store/cart";
import { createOrder } from "@/actions/orders";

interface CheckoutPageClientProps {
  customer: any;
  addresses: any[];
}

export default function CheckoutPageClient({
  customer,
  addresses,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { items, clearCart } = useCartStore();

  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethodName, setShippingMethodName] = useState("");
  const [paymentMethodCode, setPaymentMethodCode] = useState("");
  const [paymentFee, setPaymentFee] = useState(0);
  const [paymentFeeLabel, setPaymentFeeLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCompleteOrder = async () => {
    try {
      // 1. Validate Form
      const values = await form.validateFields();

      // 2. Client-side validation
      if (!shippingMethodName) {
        message.error("Please select a shipping method");
        return;
      }
      if (!paymentMethodCode) {
        message.error("Please select a payment method");
        return;
      }

      setSubmitting(true);

      // 3. Create Order
      const result = await createOrder({
        items: items,
        customerId: customer?.id || "GUEST_ID", // TODO: Handle Guest
        shippingMethodCode: values.shippingService, // Assuming CheckouForm field name
        paymentMethodCode: values.paymentMethod,
        shippingCost: shippingCost,
        paymentFee: paymentFee,
      });

      if (result.success) {
        message.success("Order placed successfully!");
        clearCart();
        router.push(`/account/orders/${result.orderId}?success=true`);
      }
    } catch (error: any) {
      console.error(error);
      if (error.errorFields) {
        message.error("Please fill in all required fields");
      } else {
        message.error("Failed to place order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Form */}
      <div className="lg:col-span-8">
        <CheckoutForm
          form={form}
          customer={customer}
          addresses={addresses}
          onShippingCostChange={(cost: number, methodName?: string) => {
            setShippingCost(cost);
            if (methodName) setShippingMethodName(methodName);
          }}
          onPaymentMethodChange={(
            code: string,
            fee: number,
            feeLabel?: string,
          ) => {
            setPaymentMethodCode(code);
            setPaymentFee(fee);
            setPaymentFeeLabel(feeLabel || "");
          }}
        />
      </div>

      {/* Right Column: Summary */}
      <div className="lg:col-span-4">
        <OrderSummary
          shippingCost={shippingCost}
          shippingMethodName={shippingMethodName}
          paymentMethodCode={paymentMethodCode}
          paymentFee={paymentFee}
          paymentFeeLabel={paymentFeeLabel}
          onCompleteOrder={handleCompleteOrder}
          loading={submitting}
        />
      </div>
    </div>
  );
}
