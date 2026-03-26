"use client";

import { Form, Radio, Skeleton } from "antd";
import type { FormInstance } from "antd";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getActiveGatewaysForCheckout,
  getPaymentMethodsForCheckout,
} from "@/actions/payment";
import {
  CHECKOUT_PAYMENT_METHODS,
  getCheckoutPaymentMethodLabel,
} from "@/lib/payment-methods";

const GATEWAY_LOGOS: Record<string, string> = {
  stripe: "/images/brands/stripe.png",
  network_international: "/images/brands/network.png",
  razorpay: "/images/brands/razorpay.png",
  phonepe: "/images/brands/phonepe.png",
};

interface PaymentMethodsProps {
  form: FormInstance;
  country: string;
  subtotal: number;
  onPaymentMethodChange: (
    code: string,
    fee: number,
    feeLabel?: string,
    gatewayCode?: string,
  ) => void;
}

export default function PaymentMethods({
  form,
  country,
  subtotal,
  onPaymentMethodChange,
}: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [activeGateways, setActiveGateways] = useState<any[]>([]);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedGatewayCode, setSelectedGatewayCode] = useState("");

  const selectedMethod = paymentMethods.find(
    (method) => method.code === selectedPaymentMethod,
  );

  const sortedPaymentMethods = useMemo(() => {
    const order = [
      CHECKOUT_PAYMENT_METHODS.ONLINE.code,
      CHECKOUT_PAYMENT_METHODS.COD.code,
    ];

    return [...paymentMethods].sort(
      (left, right) => order.indexOf(left.code) - order.indexOf(right.code),
    );
  }, [paymentMethods]);

  const availableLogoGateways = useMemo(() => {
    if (!selectedMethod) {
      return [];
    }

    return activeGateways.filter(
      (gateway) =>
        GATEWAY_LOGOS[gateway.code] &&
        selectedMethod.gatewayCodes?.includes(gateway.code),
    );
  }, [activeGateways, selectedMethod]);

  useEffect(() => {
    const load = async () => {
      setLoadingPayment(true);
      try {
        const [methods, gateways] = await Promise.all([
          getPaymentMethodsForCheckout(country, subtotal),
          getActiveGatewaysForCheckout(),
        ]);
        setPaymentMethods(methods);
        setActiveGateways(gateways);

        const currentCode = selectedPaymentMethod;
        const resolvedMethod =
          methods.find((method: any) => method.code === currentCode) ||
          methods.find(
            (method: any) =>
              method.code === CHECKOUT_PAYMENT_METHODS.ONLINE.code,
          ) ||
          methods[0] ||
          null;

        if (!resolvedMethod) {
          setSelectedPaymentMethod("");
          setSelectedGatewayCode("");
          return;
        }

        const gatewayOptions = gateways.filter(
          (gateway: any) =>
            GATEWAY_LOGOS[gateway.code] &&
            resolvedMethod.gatewayCodes?.includes(gateway.code),
        );
        const nextGatewayCode =
          resolvedMethod.code === CHECKOUT_PAYMENT_METHODS.ONLINE.code
            ? gatewayOptions.find((gateway: any) => gateway.code === selectedGatewayCode)
                ?.code || gatewayOptions[0]?.code || ""
            : "";

        form.setFieldValue("paymentMethod", resolvedMethod.code);
        setSelectedPaymentMethod(resolvedMethod.code);
        setSelectedGatewayCode(nextGatewayCode);
        onPaymentMethodChange(
          resolvedMethod.code,
          resolvedMethod.paymentFee || 0,
          resolvedMethod.paymentFeeLabel || "",
          nextGatewayCode,
        );
      } catch (err) {
        console.error("Failed to load payment methods", err);
      } finally {
        setLoadingPayment(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, subtotal, form]);

  const handleSelect = (method: any) => {
    const gatewayOptions = activeGateways.filter(
      (gateway) =>
        GATEWAY_LOGOS[gateway.code] && method.gatewayCodes?.includes(gateway.code),
    );
    const nextGatewayCode =
      method.code === CHECKOUT_PAYMENT_METHODS.ONLINE.code
        ? gatewayOptions.find((gateway) => gateway.code === selectedGatewayCode)?.code ||
          gatewayOptions[0]?.code ||
          ""
        : "";

    form.setFieldValue("paymentMethod", method.code);
    setSelectedPaymentMethod(method.code);
    setSelectedGatewayCode(nextGatewayCode);
    onPaymentMethodChange(
      method.code,
      method.paymentFee || 0,
      method.paymentFeeLabel || "",
      nextGatewayCode,
    );
  };

  const handleGatewaySelect = (gatewayCode: string) => {
    setSelectedGatewayCode(gatewayCode);
    if (!selectedMethod) {
      return;
    }

    onPaymentMethodChange(
      selectedMethod.code,
      selectedMethod.paymentFee || 0,
      selectedMethod.paymentFeeLabel || "",
      gatewayCode,
    );
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-6">Payment Method</h2>

      {loadingPayment ? (
        <div className="space-y-3">
          <Skeleton.Button active block size="large" />
          <Skeleton.Button active block size="large" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          No payment methods available for this location.
        </div>
      ) : (
        <>
          <Form.Item name="paymentMethod" className="mb-4">
            <Radio.Group
              className="w-full"
              onChange={(e) => {
                const method = paymentMethods.find(
                  (paymentMethod: any) => paymentMethod.code === e.target.value,
                );
                if (method) {
                  handleSelect(method);
                }
              }}
              value={selectedPaymentMethod}
            >
              <div className="flex flex-col gap-3">
                {sortedPaymentMethods.map((method: any) => {
                  const isSelected = selectedPaymentMethod === method.code;
                  const isOnline =
                    method.code === CHECKOUT_PAYMENT_METHODS.ONLINE.code;

                  return (
                    <div
                      key={method.id}
                      className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#003d29] bg-green-50/30 ring-1 ring-[#003d29]/20"
                          : "border-gray-200 hover:border-[#003d29]"
                      }`}
                      onClick={() => handleSelect(method)}
                    >
                      <Radio value={method.code} className="w-full">
                        <div className="flex items-center gap-3 w-full pl-2">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-[#003d29]/10" : "bg-gray-100"
                            }`}
                          >
                            {isOnline ? (
                              <CreditCard size={20} className="text-blue-500" />
                            ) : (
                              <Banknote size={20} className="text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 text-sm">
                              {method.name || getCheckoutPaymentMethodLabel(method.code)}
                            </span>
                            {method.paymentFee > 0 && (
                              <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                                <Info size={11} />
                                {method.paymentFeeLabel}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-0.5">
                              {isOnline
                                ? "Pay securely online"
                                : "Pay when your order arrives"}
                            </div>
                          </div>
                          {isSelected ? (
                            <CheckCircle2
                              size={18}
                              className="text-[#003d29] shrink-0"
                            />
                          ) : isOnline ? (
                            <ShieldCheck
                              size={16}
                              className="text-gray-300 shrink-0"
                            />
                          ) : null}
                        </div>
                      </Radio>

                      {isOnline && isSelected && availableLogoGateways.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#003d29]/10 pl-2">
                          {availableLogoGateways.length > 1 ? (
                            <>
                              <p className="text-xs text-gray-500 font-medium mb-2">
                                Payment provider
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {availableLogoGateways.map((gateway) => {
                                  const isGatewaySelected =
                                    selectedGatewayCode === gateway.code;

                                  return (
                                    <button
                                      key={gateway.id}
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleGatewaySelect(gateway.code);
                                      }}
                                      className={`flex flex-col items-center gap-1.5 border rounded-xl px-4 py-2.5 cursor-pointer transition-all min-w-[88px] ${
                                        isGatewaySelected
                                          ? "border-[#003d29] bg-[#003d29]/5 ring-1 ring-[#003d29]/20"
                                          : "border-gray-200 bg-white hover:border-gray-300"
                                      }`}
                                    >
                                      <img
                                        src={GATEWAY_LOGOS[gateway.code]}
                                        alt={gateway.name}
                                        className="h-5 w-auto object-contain"
                                      />
                                      <span
                                        className={`text-[10px] font-medium leading-none ${
                                          isGatewaySelected
                                            ? "text-[#003d29]"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {gateway.name}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="text-xs text-gray-400">
                                Processed securely via
                              </p>
                              <div className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white">
                                <img
                                  src={GATEWAY_LOGOS[availableLogoGateways[0].code]}
                                  alt={availableLogoGateways[0].name}
                                  className="h-4 w-auto object-contain"
                                />
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                                <ShieldCheck
                                  size={12}
                                  className="text-green-500"
                                />
                                Encrypted & Secure
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Radio.Group>
          </Form.Item>
        </>
      )}
    </section>
  );
}
