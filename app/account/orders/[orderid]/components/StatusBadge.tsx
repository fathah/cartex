import React from "react";

interface StatusBadgeProps {
  status: string;
  type: "order" | "payment" | "fulfill";
}

export const StatusBadge = ({ status, type }: StatusBadgeProps) => {
  let color = "bg-gray-100 text-gray-600";
  if (["PAID", "FULFILLED", "SUCCESS"].includes(status))
    color = "bg-green-100 text-green-700";
  if (["PENDING", "PROCESSING", "ORDERED", "SHIPPED"].includes(status))
    color = "bg-amber-100 text-amber-700";
  if (["FAILED", "CANCELLED", "RETURNED"].includes(status))
    color = "bg-red-100 text-red-700";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};
