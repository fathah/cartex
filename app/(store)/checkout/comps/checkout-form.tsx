"use client";

import { Form, Button, message } from "antd";
import { useEffect, useState } from "react";
import { getShippingMethodsForAddress } from "@/app/actions/shipping";

// Components
import DeliveryAddress from "./DeliveryAddress";
import ShippingMethods from "./ShippingMethods";
import PaymentMethods from "./PaymentMethods";

interface CheckoutFormProps {
  customer: any;
  addresses: any[];
  onShippingCostChange: (cost: number) => void;
}

export default function CheckoutForm({
  customer,
  addresses,
  onShippingCostChange,
}: CheckoutFormProps) {
  const [form] = Form.useForm();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.length > 0 ? addresses[0].id : null,
  );

  // Shipping State
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Fetch methods when address changes
  useEffect(() => {
    const fetchShipping = async () => {
      let country = "";

      if (selectedAddressId) {
        const addr = addresses.find((a) => a.id === selectedAddressId);
        if (addr) country = addr.country;
      } else {
        country = "AE";
      }
      console.log("country", country);

      if (!country) return;

      setLoadingShipping(true);
      try {
        console.log("Country", country);

        const methods = await getShippingMethodsForAddress(country);
        setShippingMethods(methods);

        const currentMethod = form.getFieldValue("shippingService");
        if (
          methods.length > 0 &&
          (!currentMethod || !methods.find((m) => m.code === currentMethod))
        ) {
          form.setFieldValue("shippingService", methods[0].code);
          // Set initial shipping cost
          const firstMethodRate = methods[0].rates?.[0];
          if (
            firstMethodRate &&
            (firstMethodRate.type === "FLAT" ||
              firstMethodRate.type === "PRICE")
          ) {
            onShippingCostChange(Number(firstMethodRate.price));
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
  }, [selectedAddressId, addresses, form]);

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
        onShippingChange={onShippingCostChange}
      />

      <PaymentMethods form={form} />

      <Button
        type="primary"
        htmlType="submit"
        size="large"
        block
        className="bg-[#003d29] hover:bg-[#002a1c] h-14 text-lg font-medium rounded-xl"
      >
        Pay Now
      </Button>
    </Form>
  );
}
