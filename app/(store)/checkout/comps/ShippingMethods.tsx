"use client";

import { Form, Radio } from "antd";
import { Truck, Loader2 } from "lucide-react";
import { useEffect } from "react";
import Currency from "../../../../components/common/Currency";

interface ShippingMethodsProps {
  loading: boolean;
  shippingMethods: any[];
  form: any;
  onShippingChange: (cost: number) => void;
}

export default function ShippingMethods({
  loading,
  shippingMethods,
  form,
  onShippingChange,
}: ShippingMethodsProps) {
  const getMethodPrice = (method: any) => {
    const rate = method.rates?.[0];
    if (!rate) return null;
    if (rate.type === "FLAT" || rate.type === "PRICE") {
      return Number(rate.price);
    }
    return 0;
  };

  // Watch for shipping method changes
  useEffect(() => {
    const subscription = form.getFieldInstance("shippingService");
    const currentValue = form.getFieldValue("shippingService");

    if (currentValue && shippingMethods.length > 0) {
      const selectedMethod = shippingMethods.find(
        (m) => m.code === currentValue,
      );
      if (selectedMethod) {
        const price = getMethodPrice(selectedMethod);
        onShippingChange(price || 0);
      }
    }
  }, [form, shippingMethods, onShippingChange]);

  const handleMethodChange = (e: any) => {
    const selectedCode = e.target.value;
    const selectedMethod = shippingMethods.find((m) => m.code === selectedCode);
    if (selectedMethod) {
      const price = getMethodPrice(selectedMethod);
      onShippingChange(price || 0);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-6">Shipping Services</h2>

      {loading ? (
        <div className="text-center py-6 text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={20} /> Loading rates...
        </div>
      ) : shippingMethods.length === 0 ? (
        <div className="p-4 bg-orange-50 text-orange-600 rounded-lg text-sm border border-orange-100">
          No shipping methods available for this location.
        </div>
      ) : (
        <Form.Item
          name="shippingService"
          rules={[
            { required: true, message: "Please select a shipping method" },
          ]}
          className="mb-0"
        >
          <Radio.Group
            className="w-full flex flex-col gap-3"
            onChange={handleMethodChange}
          >
            {shippingMethods.map((method) => {
              const price = getMethodPrice(method);
              return (
                <div
                  key={method.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#003d29] hover:bg-green-50/20 transition-colors cursor-pointer"
                >
                  <Radio value={method.code} className="w-full">
                    <div className="flex justify-between items-center w-full pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                          <Truck size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-base">
                            {method.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {method.description || "3-5 Business Days"}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-base text-gray-900">
                        {price === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : price !== null ? (
                          <Currency value={price} />
                        ) : (
                          <span className="text-sm text-gray-500">TBD</span>
                        )}
                      </div>
                    </div>
                  </Radio>
                </div>
              );
            })}
          </Radio.Group>
        </Form.Item>
      )}
    </section>
  );
}
