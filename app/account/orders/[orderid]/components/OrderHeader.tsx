import React from "react";
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { ArrowLeft, Calendar } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface OrderHeaderProps {
  orderNumber: string | number;
  orderId: string;
  status: string;
  createdAt: string;
}

export const OrderHeader = ({
  orderNumber,
  orderId,
  status,
  createdAt,
}: OrderHeaderProps) => {
  const displayId = orderNumber || orderId.slice(-6).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/account/orders"
            className="text-gray-400 hover:text-black"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Order #{displayId}</h1>
          <StatusBadge status={status} type="order" />
        </div>
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <Calendar size={14} />
          {formatDate(createdAt)} at{" "}
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};
