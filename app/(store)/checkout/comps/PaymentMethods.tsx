"use client";

import { Form, Radio, Skeleton } from "antd";
import type { FormInstance } from "antd";
import {
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getPaymentMethodsForCheckout,
  getActiveGatewaysForCheckout,
} from "@/actions/payment";

// Gateway code → logo path mapping
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [selectedGatewayCode, setSelectedGatewayCode] = useState<string>("");

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

        // Auto-select silently when only 1 gateway
        const logoGws = gateways.filter((g: any) => GATEWAY_LOGOS[g.code]);
        if (logoGws.length === 1) setSelectedGatewayCode(logoGws[0].code);

        const currentCode = selectedPaymentMethod;
        const stillValid = methods.find((m: any) => m.code === currentCode);

        if (!stillValid && methods.length > 0) {
          const defaultMethod = methods[0];
          const autoGw = logoGws.length === 1 ? logoGws[0].code : "";
          form.setFieldValue("paymentMethod", defaultMethod.code);
          setSelectedPaymentMethod(defaultMethod.code);
          onPaymentMethodChange(
            defaultMethod.code,
            defaultMethod.paymentFee || 0,
            defaultMethod.paymentFeeLabel || "",
            autoGw,
          );
        } else if (stillValid) {
          const autoGw =
            logoGws.length === 1 ? logoGws[0].code : selectedGatewayCode;
          onPaymentMethodChange(
            stillValid.code,
            stillValid.paymentFee || 0,
            stillValid.paymentFeeLabel || "",
            autoGw,
          );
        }
      } catch (err) {
        console.error("Failed to load payment methods", err);
      } finally {
        setLoadingPayment(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, subtotal, form]);

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "CARD":
        return <CreditCard size={20} className="text-blue-500" />;
      case "COD":
        return <Banknote size={20} className="text-green-600" />;
      case "WALLET":
        return <Wallet size={20} className="text-purple-600" />;
      default:
        return <CreditCard size={20} className="text-gray-500" />;
    }
  };

  const handleSelect = (method: any) => {
    form.setFieldValue("paymentMethod", method.code);
    setSelectedPaymentMethod(method.code);
    onPaymentMethodChange(
      method.code,
      method.paymentFee || 0,
      method.paymentFeeLabel || "",
      selectedGatewayCode,
    );
  };

  const logoGateways = activeGateways.filter((g) => GATEWAY_LOGOS[g.code]);
  // Show a picker only when there are 2+ gateways configured
  const showGatewayPicker = logoGateways.length > 1;

  const selectedCardMethod = paymentMethods.find(
    (m) => m.type === "CARD" && m.code === selectedPaymentMethod,
  );

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
                  (m: any) => m.code === e.target.value,
                );
                if (method) handleSelect(method);
              }}
              value={selectedPaymentMethod}
            >
              <div className="flex flex-col gap-3">
                {paymentMethods.map((method: any) => {
                  const isSelected = selectedPaymentMethod === method.code;
                  const isCard = method.type === "CARD";

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
                            {getPaymentIcon(method.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 text-sm">
                              {method.name}
                            </span>
                            {method.paymentFee > 0 && (
                              <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                                <Info size={11} />
                                {method.paymentFeeLabel}
                              </div>
                            )}
                          </div>
                          {isSelected ? (
                            <CheckCircle2
                              size={18}
                              className="text-[#003d29] shrink-0"
                            />
                          ) : isCard ? (
                            <ShieldCheck
                              size={16}
                              className="text-gray-300 shrink-0"
                            />
                          ) : null}
                        </div>
                      </Radio>

                      {/* Gateway section — only for CARD when selected */}
                      {isCard && isSelected && logoGateways.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#003d29]/10 pl-2">
                          {showGatewayPicker ? (
                            /* ── 2+ gateways: show a picker ── */
                            <>
                              <p className="text-xs text-gray-500 font-medium mb-2">
                                Choose payment provider
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {logoGateways.map((gw) => {
                                  const isGwSelected =
                                    selectedGatewayCode === gw.code;
                                  return (
                                    <button
                                      key={gw.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedGatewayCode(gw.code);
                                        // Notify parent of updated gateway selection
                                        const currentMethod =
                                          paymentMethods.find(
                                            (m) =>
                                              m.code === selectedPaymentMethod,
                                          );
                                        if (currentMethod) {
                                          onPaymentMethodChange(
                                            currentMethod.code,
                                            currentMethod.paymentFee || 0,
                                            currentMethod.paymentFeeLabel || "",
                                            gw.code,
                                          );
                                        }
                                      }}
                                      className={`flex flex-col items-center gap-1.5 border rounded-xl px-4 py-2.5 cursor-pointer transition-all min-w-[80px] ${
                                        isGwSelected
                                          ? "border-[#003d29] bg-[#003d29]/5 ring-1 ring-[#003d29]/20"
                                          : "border-gray-200 bg-white hover:border-gray-300"
                                      }`}
                                    >
                                      <img
                                        src={GATEWAY_LOGOS[gw.code]}
                                        alt={gw.name}
                                        className="h-5 w-auto object-contain"
                                      />
                                      <span
                                        className={`text-[10px] font-medium leading-none ${isGwSelected ? "text-[#003d29]" : "text-gray-500"}`}
                                      >
                                        {gw.name}
                                      </span>
                                      {isGwSelected && (
                                        <CheckCircle2
                                          size={12}
                                          className="text-[#003d29]"
                                        />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            /* ── Single gateway: just show a small trust strip ── */
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="text-xs text-gray-400">
                                Processed securely via
                              </p>
                              <div className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white">
                                <img
                                  src={GATEWAY_LOGOS[logoGateways[0].code]}
                                  alt={logoGateways[0].name}
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

          {/* "We accept" strip — shown when a non-card method is selected or nothing yet */}
          {logoGateways.length > 0 && !selectedCardMethod && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs text-gray-400">We accept:</span>
              {logoGateways.map((gw) => (
                <div
                  key={gw.id}
                  className="border border-gray-200 rounded-lg px-2 py-1 bg-white"
                  title={gw.name}
                >
                  <img
                    src={GATEWAY_LOGOS[gw.code]}
                    alt={gw.name}
                    className="h-4 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
