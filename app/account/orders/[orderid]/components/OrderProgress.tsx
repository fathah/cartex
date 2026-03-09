import React from "react";
import { Steps } from "antd";
import { ClipboardList, Package, Truck, CheckCircle } from "lucide-react";

interface OrderProgressProps {
  status: string;
  fulfillmentStatus: string;
}

export const OrderProgress = ({
  status,

  fulfillmentStatus,
}: OrderProgressProps) => {
  const getStepStatus = () => {
    if (status === "CANCELLED") return { current: 0, status: "error" as const };

    let current = 0;
    // Step 0: Ordered (Default)

    // Step 1: Processing
    if (status === "PROCESSING") current = 1;

    // Step 2: Shipped
    if (status === "SHIPPED") current = 2;

    // Step 3: Delivered
    if (status === "FULFILLED" || fulfillmentStatus === "FULFILLED")
      current = 3;

    return { current, status: "process" as const };
  };

  const stepInfo = getStepStatus();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
      <Steps
        current={stepInfo.current}
        status={stepInfo.status}
        items={[
          { title: "Ordered", icon: <ClipboardList size={20} /> },
          { title: "Processing", icon: <Package size={20} /> },
          { title: "Shipped", icon: <Truck size={20} /> },
          { title: "Delivered", icon: <CheckCircle size={20} /> },
        ]}
      />
    </div>
  );
};
