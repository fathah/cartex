"use client";

import { Form, Radio, Skeleton } from "antd";
import type { FormInstance } from "antd";
import { CreditCard, Wallet, Banknote, ShieldCheck, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { getPaymentMethodsForCheckout } from "@/actions/payment";

interface PaymentMethodsProps {
  form: FormInstance;
  country: string;
  subtotal: number;
  onPaymentMethodChange: (code: string, fee: number, feeLabel?: string) => void;
}

export default function PaymentMethods({
  form,
  country,
  subtotal,
  onPaymentMethodChange,
}: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

  // Re-fetch when country or subtotal changes
  useEffect(() => {
    const loadPaymentMethods = async () => {
      setLoadingPayment(true);
      try {
        const methods = await getPaymentMethodsForCheckout(country, subtotal);
        setPaymentMethods(methods);

        // Check if current selection is still valid
        const currentCode = selectedPaymentMethod;
        const stillValid = methods.find((m: any) => m.code === currentCode);

        if (!stillValid && methods.length > 0) {
          const defaultMethod = methods[0];
          form.setFieldValue("paymentMethod", defaultMethod.code);
          setSelectedPaymentMethod(defaultMethod.code);
          onPaymentMethodChange(
            defaultMethod.code,
            defaultMethod.paymentFee || 0,
            defaultMethod.paymentFeeLabel || "",
          );
        } else if (stillValid) {
          // Update fee in case conditions changed
          onPaymentMethodChange(
            stillValid.code,
            stillValid.paymentFee || 0,
            stillValid.paymentFeeLabel || "",
          );
        }
      } catch (err) {
        console.error("Failed to load payment methods", err);
      } finally {
        setLoadingPayment(false);
      }
    };
    loadPaymentMethods();
  }, [country, subtotal, form]);

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "CARD":
        return <CreditCard size={20} className="text-blue-600" />;
      case "COD":
        return <Banknote size={20} className="text-green-600" />;
      case "WALLET":
        return <Wallet size={20} className="text-purple-600" />;
      default:
        return <CreditCard size={20} className="text-gray-600" />;
    }
  };

  const handleSelect = (method: any) => {
    form.setFieldValue("paymentMethod", method.code);
    setSelectedPaymentMethod(method.code);
    onPaymentMethodChange(
      method.code,
      method.paymentFee || 0,
      method.paymentFeeLabel || "",
    );
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-6">Payment Method</h2>

      {loadingPayment ? (
        <div className="space-y-4">
          <Skeleton.Button
            active
            block
            size="large"
            className="h-16 w-full rounded-xl"
          />
          <Skeleton.Button
            active
            block
            size="large"
            className="h-16 w-full rounded-xl"
          />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          No payment methods available for this location.
        </div>
      ) : (
        <Form.Item name="paymentMethod" className="mb-6">
          <Radio.Group
            className="w-full flex flex-col gap-3"
            onChange={(e) => {
              const method = paymentMethods.find(
                (m: any) => m.code === e.target.value,
              );
              if (method) handleSelect(method);
            }}
            value={selectedPaymentMethod}
          >
            <div className="flex flex-col gap-3">
              {paymentMethods.map((method: any) => {
                const isSelected = selectedPaymentMethod === method.code;
                const isCOD = method.type === "COD";

                return (
                  <div
                    key={method.id}
                    className={`
                    border rounded-xl p-4 shadow-sm cursor-pointer transition-all
                    ${
                      isSelected
                        ? "border-[#003d29] bg-[#f0fdf4]"
                        : "border-gray-200 hover:border-[#003d29]"
                    }
                  `}
                    onClick={() => handleSelect(method)}
                  >
                    <Radio value={method.code} className="w-full">
                      <div className="flex items-center gap-3 w-full pl-2">
                        {getPaymentIcon(method.type)}
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {method.name}
                          </span>
                          {/* Generalized fee indicator */}
                          {method.paymentFee > 0 && (
                            <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                              <Info size={11} />
                              {method.paymentFeeLabel}
                            </div>
                          )}
                        </div>
                        {/* Trust badge for cards */}
                        {method.type === "CARD" && (
                          <ShieldCheck
                            size={16}
                            className="text-green-500 shrink-0 ml-auto"
                          />
                        )}
                      </div>
                    </Radio>
                  </div>
                );
              })}
            </div>
          </Radio.Group>
        </Form.Item>
      )}
    </section>
  );
}
