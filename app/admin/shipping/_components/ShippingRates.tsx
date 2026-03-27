"use client";

import React from "react";
import { Button, Tag } from "antd";
import { Edit2, Trash2 } from "lucide-react";
import AdminMoney from "@/components/common/AdminMoney";
import {
  SHIPPING_RATE_APPLICATION,
  SHIPPING_RATE_TYPE,
} from "@/lib/shipping-constants";

interface ShippingRatesProps {
  rates: any[];
  zoneId: string;
  onEditRate: (rate: any) => void;
  onDeleteRate: (id: string) => void;
}

function formatRateSummary(rate: any) {
  if (rate.type === SHIPPING_RATE_TYPE.FLAT) return "Flat price";
  if (rate.type === SHIPPING_RATE_TYPE.WEIGHT) return "Weight band";
  if (rate.type === SHIPPING_RATE_TYPE.PRICE) return "Order value band";
  if (rate.type === SHIPPING_RATE_TYPE.CONDITIONAL) {
    return Number(rate.price) === 0 ? "Free shipping rule" : "Conditional rule";
  }
  return rate.type;
}

export default function ShippingRates({
  rates,
  zoneId,
  onEditRate,
  onDeleteRate,
}: ShippingRatesProps) {
  const zoneRates = (rates || []).filter(
    (rate) => !rate.shippingZoneId || rate.shippingZoneId === zoneId,
  );

  if (zoneRates.length === 0) {
    return <span className="text-gray-400 text-xs">No rates configured</span>;
  }

  return (
    <div className="space-y-2">
      {zoneRates.map((rate) => (
        <div
          key={rate.id}
          className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
        >
          <div className="flex items-center gap-2">
            <Tag color="blue" className="mr-0">
              {rate.type}
            </Tag>
            {!rate.isActive && <Tag color="default">Inactive</Tag>}
            <span className="font-medium">{formatRateSummary(rate)}</span>
            {rate.applicationType === SHIPPING_RATE_APPLICATION.SURCHARGE && (
              <Tag color="gold">Surcharge</Tag>
            )}
            {rate.shippingProfile && (
              <Tag color="purple">{rate.shippingProfile.name}</Tag>
            )}
            <span className="ml-auto text-xs text-gray-500">
              Priority {rate.priority || 0}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
            <span>
              Price: <AdminMoney value={Number(rate.price)} />
            </span>
            {(rate.type === SHIPPING_RATE_TYPE.CONDITIONAL ||
              rate.type === SHIPPING_RATE_TYPE.PRICE) && (
              <span>
                Range: <AdminMoney value={Number(rate.minOrderAmount || 0)} /> -{" "}
                {rate.maxOrderAmount ? (
                  <AdminMoney value={Number(rate.maxOrderAmount)} />
                ) : (
                  "∞"
                )}
              </span>
            )}
            {(rate.minWeightGrams || rate.maxWeightGrams) && (
              <span>
                Weight: {rate.minWeightGrams || 0}g -{" "}
                {rate.maxWeightGrams || "∞"}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1">
            <Button
              type="text"
              size="small"
              icon={<Edit2 size={12} />}
              onClick={() => onEditRate(rate)}
            >
              Edit
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 size={12} />}
              onClick={() => onDeleteRate(rate.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
