"use client";

import { Form, Radio } from "antd";
import { Truck, Loader2, Sparkles, BadgePercent } from "lucide-react";
import Currency from "../../../../components/common/Currency";

interface ShippingMethodsProps {
  loading: boolean;
  shippingMethods: any[];
  form: any;
  subtotal: number;
  onShippingChange: (cost: number, methodName?: string) => void;
}

export default function ShippingMethods({
  loading,
  shippingMethods,
  form,
  subtotal,
  onShippingChange,
}: ShippingMethodsProps) {
  const handleMethodChange = (e: any) => {
    const selectedCode = e.target.value;
    const selectedMethod = shippingMethods.find(
      (m: any) => m.code === selectedCode,
    );
    if (selectedMethod) {
      onShippingChange(selectedMethod.calculatedPrice, selectedMethod.name);
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
          <Radio.Group className="w-full" onChange={handleMethodChange}>
            <div className="flex flex-col gap-3">
              {shippingMethods.map((method: any) => {
                const price = method.calculatedPrice;
                const isFree = price === 0;
                const isRecommended = method.isRecommended;
                const freeAbove = method.freeAbove;
                // How much more user needs to spend for free shipping
                const spendMore =
                  freeAbove && subtotal < freeAbove
                    ? freeAbove - subtotal
                    : null;

                return (
                  <div
                    key={method.id}
                    className={`
                    border rounded-xl p-4 transition-colors cursor-pointer relative
                    ${
                      isRecommended
                        ? "border-[#003d29] bg-green-50/30 ring-1 ring-[#003d29]/20"
                        : "border-gray-200 hover:border-[#003d29] hover:bg-green-50/20"
                    }
                  `}
                  >
                    {/* Recommended badge */}
                    {isRecommended && (
                      <div className="absolute -top-2.5 left-4 bg-[#003d29] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={10} /> Best Value
                      </div>
                    )}

                    <Radio value={method.code} className="w-full">
                      <div className="flex justify-between items-center w-full pl-2 min-w-0">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isFree
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Truck size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-base">
                              {method.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {method.description || "3-5 Business Days"}
                            </div>
                            {/* Free shipping threshold hint */}
                            {spendMore !== null && spendMore > 0 && (
                              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                <BadgePercent size={12} />
                                Spend <Currency value={spendMore} /> more for
                                free shipping
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-bold text-base shrink-0 ml-auto text-right">
                          {isFree ? (
                            <span className="text-green-600 flex items-center gap-1">
                              Free ✨
                            </span>
                          ) : (
                            <Currency value={price} />
                          )}
                        </div>
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
