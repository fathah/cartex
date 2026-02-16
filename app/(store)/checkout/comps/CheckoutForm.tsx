"use client";

import { Form, message } from "antd";
import type { FormInstance } from "antd";
import { useEffect, useState, useMemo } from "react";
import { getSmartShippingMethods } from "@/actions/shipping";
import { useCartStore } from "@/lib/store/cart";

// Components
import DeliveryAddress from "./DeliveryAddress";
import ShippingMethods from "./ShippingMethods";
import PaymentMethods from "./PaymentMethods";

interface CheckoutFormProps {
  customer: any;
  addresses: any[];
  onAddressChange: (addressId: string | null) => void;
  onShippingCostChange: (cost: number, methodName?: string) => void;
  onPaymentMethodChange: (code: string, fee: number, feeLabel?: string) => void;
  form: FormInstance;
}

export default function CheckoutForm({
  customer,
  addresses,
  onAddressChange,
  onShippingCostChange,
  onPaymentMethodChange,
  form, // Use passed form
}: CheckoutFormProps) {
  // const [form] = Form.useForm(); // Removed internal instance
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.length > 0 ? addresses[0].id : null,
  );

  // Cart state for subtotal
  const { items } = useCartStore();
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  // Derive country from selected address
  const selectedAddress = useMemo(() => {
    if (selectedAddressId) {
      return addresses.find((a) => a.id === selectedAddressId) || null;
    }
    return null;
  }, [selectedAddressId, addresses]);

  const country = selectedAddress?.country || "AE";
  const state = selectedAddress?.province || undefined;
  const city = selectedAddress?.city || undefined;
  const zipCode = selectedAddress?.zip || undefined;

  // Shipping State
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Fetch smart shipping methods when address or subtotal changes
  useEffect(() => {
    onAddressChange(selectedAddressId);
    const fetchShipping = async () => {
      if (!country) return;

      setLoadingShipping(true);
      try {
        const methods = await getSmartShippingMethods(
          country,
          subtotal,
          state,
          city,
          zipCode,
        );
        setShippingMethods(methods);

        const currentMethod = form.getFieldValue("shippingService");
        if (
          methods.length > 0 &&
          (!currentMethod ||
            !methods.find((m: any) => m.code === currentMethod))
        ) {
          const first = methods[0];
          form.setFieldValue("shippingService", first.code);
          onShippingCostChange(first.calculatedPrice, first.name);
        } else if (methods.length > 0 && currentMethod) {
          // Update price for the currently selected method (subtotal might have changed)
          const selected = methods.find((m: any) => m.code === currentMethod);
          if (selected) {
            onShippingCostChange(selected.calculatedPrice, selected.name);
          }
        }
      } catch (err) {
        console.error(err);
        message.error("Failed to load shipping rates");
      } finally {
        setLoadingShipping(false);
      }
    };

    fetchShipping();
  }, [selectedAddressId, country, state, city, zipCode, subtotal, form, onAddressChange]);

  const onFinish = (values: any) => {
    console.log("Received values of form: ", { ...values, selectedAddressId });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        paymentMethod: "credit_card",
        fullName: customer ? `${customer.firstName} ${customer.lastName}` : "",
        email: customer?.email || "",
        phone: customer?.phone || "",
      }}
      requiredMark={false}
    >
      <DeliveryAddress
        customer={customer}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
      />

      <ShippingMethods
        loading={loadingShipping}
        shippingMethods={shippingMethods}
        form={form}
        subtotal={subtotal}
        onShippingChange={(cost: number, methodName?: string) =>
          onShippingCostChange(cost, methodName)
        }
      />

      <PaymentMethods
        form={form}
        country={country}
        subtotal={subtotal}
        onPaymentMethodChange={onPaymentMethodChange}
      />
    </Form>
  );
}
