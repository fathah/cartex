"use client";

import { useState, useMemo, useEffect } from "react";
import { Form, message } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderSummary from "./comps/OrderSummary";
import DeliveryAddress from "./comps/DeliveryAddress";
import ShippingMethods from "./comps/ShippingMethods";
import PaymentMethods from "./comps/PaymentMethods";
import OrderReview from "./comps/OrderReview";
import { useCartStore } from "@/lib/store/cart";
import { createOrder } from "@/actions/orders";
import { initiateGatewayPayment } from "@/actions/gateway";
import { getSmartShippingMethods } from "@/actions/shipping";
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

interface CheckoutPageClientProps {
  customer: any;
  addresses: any[];
  taxRate?: number;
  taxMode?: string;
}

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Shipping", icon: Truck },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Review", icon: CheckCircle2 },
];

function createCheckoutRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CheckoutPageClient({
  customer,
  addresses,
  taxRate = 5,
  taxMode = "EXCLUSIVE",
}: CheckoutPageClientProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Step state
  const [step, setStep] = useState(1);

  // Address
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.length > 0 ? addresses[0].id : null,
  );
  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? null,
    [selectedAddressId, addresses],
  );

  // Cart subtotal
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  // Shipping
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethodName, setShippingMethodName] = useState("");
  const [selectedShippingCode, setSelectedShippingCode] = useState("");

  // Payment
  const [paymentMethodCode, setPaymentMethodCode] = useState("");
  const [paymentFee, setPaymentFee] = useState(0);
  const [paymentFeeLabel, setPaymentFeeLabel] = useState("");
  const [selectedGatewayCode, setSelectedGatewayCode] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState(createCheckoutRequestId);

  const [submitting, setSubmitting] = useState(false);

  const country = selectedAddress?.country || "AE";
  const state = selectedAddress?.province || undefined;
  const city = selectedAddress?.city || undefined;
  const zipCode = selectedAddress?.zip || undefined;

  // Fetch shipping methods when address / subtotal changes
  useEffect(() => {
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

        const currentMethod = selectedShippingCode;
        if (
          methods.length > 0 &&
          (!currentMethod ||
            !methods.find((m: any) => m.code === currentMethod))
        ) {
          const first = methods[0];
          form.setFieldValue("shippingService", first.code);
          setSelectedShippingCode(first.code);
          setShippingCost(first.calculatedPrice);
          setShippingMethodName(first.name);
        } else if (methods.length > 0 && currentMethod) {
          const selected = methods.find((m: any) => m.code === currentMethod);
          if (selected) {
            setShippingCost(selected.calculatedPrice);
            setShippingMethodName(selected.name);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId, country, state, city, zipCode, subtotal]);

  // Navigation
  const goNext = () => {
    if (step === 1 && !selectedAddressId) {
      message.warning("Please select a delivery address");
      return;
    }
    if (step === 2 && !selectedShippingCode) {
      message.warning("Please select a shipping method");
      return;
    }
    if (step === 3 && !paymentMethodCode) {
      message.warning("Please select a payment method");
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  // Complete order — create first (PENDING), then route to gateway
  const handleCompleteOrder = async () => {
    try {
      if (!paymentMethodCode) {
        message.error("Please select a payment method");
        return;
      }
      setSubmitting(true);

      // 1. Create order (PaymentIntent is PENDING at this point)
      const result = await createOrder({
        checkoutRequestId,
        items,
        shippingMethodCode: selectedShippingCode,
        paymentMethodCode,
        shippingAddressId: selectedAddressId!,
      });
      if (!result.success) {
        message.error("Failed to create order. Please try again.");
        return;
      }
      const orderId = result.orderId;

      // 2. No gateway selected (COD, wallet, etc.) — done
      if (!selectedGatewayCode) {
        message.success("Order placed successfully!");
        useCartStore.getState().clearCart();
        setCheckoutRequestId(createCheckoutRequestId());
        router.push(`/account/orders/${orderId}?success=true`);
        return;
      }

      // 3. Initiate gateway payment
      const gateway = await initiateGatewayPayment(
        orderId,
        selectedGatewayCode,
      );

      if ("error" in gateway) {
        message.error(gateway.error);
        // Order exists but payment failed — redirect to order page so user can retry
        router.push(`/account/orders/${orderId}`);
        return;
      }

      if (gateway.type === "redirect") {
        // Stripe, Network International, PhonePe — redirect to hosted page
        useCartStore.getState().clearCart();
        setCheckoutRequestId(createCheckoutRequestId());
        window.location.href = gateway.url;
        return;
      }

      if (gateway.type === "razorpay") {
        // Load Razorpay JS SDK if not already loaded
        await new Promise<void>((resolve, reject) => {
          if ((window as any).Razorpay) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.body.appendChild(script);
        });

        const rzp = new (window as any).Razorpay({
          key: gateway.keyId,
          amount: gateway.amount,
          currency: gateway.currency,
          name: gateway.name,
          order_id: gateway.orderId,
          handler: () => {
            useCartStore.getState().clearCart();
            setCheckoutRequestId(createCheckoutRequestId());
            router.push(`/account/orders/${orderId}?success=true`);
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              message.info(
                "Payment cancelled. Your order is saved — you can retry from My Orders.",
              );
              router.push(`/account/orders/${orderId}`);
            },
          },
        });
        rzp.open();
        return;
      }

      // type === "none"
      message.success("Order placed successfully!");
      useCartStore.getState().clearCart();
      setCheckoutRequestId(createCheckoutRequestId());
      router.push(`/account/orders/${orderId}?success=true`);
    } catch (error: any) {
      console.error(error);
      message.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Empty cart guard (wait for hydration first)
  if (mounted && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingCart size={36} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8 max-w-xs">
          Looks like you haven&apos;t added anything yet. Head back to shop to
          continue.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002a1c] text-white px-8 h-12 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-[#003d29]/20 active:scale-[0.98]"
        >
          Shop Now <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={{ paymentMethod: "credit_card" }}
    >
      {/* Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((s, idx) => {
            const isDone = step > s.id;
            const isActive = step === s.id;
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm
                      ${isDone ? "border-[#003d29] bg-[#003d29] text-white" : ""}
                      ${isActive ? "border-[#003d29] bg-white text-[#003d29] shadow-md shadow-[#003d29]/20" : ""}
                      ${!isDone && !isActive ? "border-gray-200 bg-white text-gray-400" : ""}
                    `}
                  >
                    {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      isActive || isDone ? "text-[#003d29]" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-500 ${
                      step > s.id ? "bg-[#003d29]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Step Content */}
        <div className="lg:col-span-8">
          {/* STEP 1: Address */}
          {step === 1 && (
            <div>
              <DeliveryAddress
                customer={customer}
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
              />
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002a1c] text-white px-8 h-12 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-[#003d29]/20 active:scale-[0.98] cursor-pointer"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping */}
          {step === 2 && (
            <div>
              {selectedAddress && (
                <div className="mb-6 flex items-start gap-3 bg-green-50 border border-[#003d29]/20 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#003d29]/10 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-[#003d29]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#003d29] font-semibold uppercase tracking-wider mb-0.5">
                      Delivering to
                    </div>
                    <div className="font-semibold text-sm text-gray-900">
                      {selectedAddress.fullname}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {selectedAddress.address1}
                      {selectedAddress.address2 &&
                        `, ${selectedAddress.address2}`}
                      {`, ${selectedAddress.city}, ${selectedAddress.country}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#003d29] font-medium hover:underline shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}

              <ShippingMethods
                loading={loadingShipping}
                shippingMethods={shippingMethods}
                form={form}
                subtotal={subtotal}
                onShippingChange={(cost, methodName, code) => {
                  setShippingCost(cost);
                  if (methodName) setShippingMethodName(methodName);
                  if (code) setSelectedShippingCode(code);
                }}
              />

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 h-12 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002a1c] text-white px-8 h-12 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-[#003d29]/20 active:scale-[0.98] cursor-pointer"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <div>
              {shippingMethodName && (
                <div className="mb-6 flex items-center gap-3 bg-green-50 border border-[#003d29]/20 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#003d29]/10 flex items-center justify-center shrink-0">
                    <Truck size={16} className="text-[#003d29]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#003d29] font-semibold uppercase tracking-wider mb-0.5">
                      Shipping via
                    </div>
                    <div className="font-semibold text-sm text-gray-900">
                      {shippingMethodName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-[#003d29] font-medium hover:underline shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}

              <PaymentMethods
                form={form}
                country={country}
                subtotal={subtotal}
                onPaymentMethodChange={(code, fee, feeLabel, gatewayCode) => {
                  setPaymentMethodCode(code);
                  setPaymentFee(fee);
                  setPaymentFeeLabel(feeLabel || "");
                  setSelectedGatewayCode(gatewayCode || "");
                }}
              />

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 h-12 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 bg-[#003d29] hover:bg-[#002a1c] text-white px-8 h-12 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-[#003d29]/20 active:scale-[0.98] cursor-pointer"
                >
                  Review Order <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review — extracted to OrderReview component */}
          {step === 4 && (
            <OrderReview
              items={items}
              selectedAddress={selectedAddress}
              shippingMethodName={shippingMethodName}
              shippingCost={shippingCost}
              paymentMethodCode={paymentMethodCode}
              paymentFee={paymentFee}
              paymentFeeLabel={paymentFeeLabel}
              onGoBack={goBack}
              onChangeAddress={() => setStep(1)}
              onChangeShipping={() => setStep(2)}
              onChangePayment={() => setStep(3)}
            />
          )}
        </div>

        {/* Right: Summary (always visible) */}
        <div className="lg:col-span-4">
          <OrderSummary
            shippingCost={shippingCost}
            shippingMethodName={shippingMethodName}
            paymentMethodCode={paymentMethodCode}
            paymentFee={paymentFee}
            paymentFeeLabel={paymentFeeLabel}
            onCompleteOrder={handleCompleteOrder}
            loading={submitting}
            currentStep={step}
            taxRate={taxRate}
            taxMode={taxMode}
          />
        </div>
      </div>
    </Form>
  );
}
