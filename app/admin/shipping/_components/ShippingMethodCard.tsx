"use client";

import React, { useState } from "react";
import { Button, Tag, message } from "antd";
import { Edit2, Plus, Trash2, Truck } from "lucide-react";
import { deleteShippingMethod, deleteShippingRate } from "@/actions/shipping";
import { formatDeliveryEstimate } from "@/lib/shipping";
import MethodModal from "./modals/MethodModal";
import RateModal from "./modals/RateModal";
import ShippingRates from "./ShippingRates";
import { useShipping } from "./ShippingProvider";

interface ShippingMethodCardProps {
  method: any;
  zoneId: string;
}

export default function ShippingMethodCard({
  method,
  zoneId,
}: ShippingMethodCardProps) {
  const { fetchZones } = useShipping();
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);

  const handleDeleteMethod = async () => {
    try {
      await deleteShippingMethod(method.id);
      message.success("Method deleted");
      fetchZones();
    } catch {
      message.error("Failed to delete method");
    }
  };

  const handleAddRate = () => {
    setEditingRate(null);
    setIsRateModalOpen(true);
  };

  const handleEditRate = (rate: any) => {
    setEditingRate(rate);
    setIsRateModalOpen(true);
  };

  const handleDeleteRate = async (id: string) => {
    try {
      await deleteShippingRate(id);
      message.success("Rate deleted");
      fetchZones();
    } catch {
      message.error("Failed to delete rate");
    }
  };

  return (
    <>
      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-blue-500" />
              <span className="font-medium">{method.name}</span>
              <span className="rounded bg-gray-100 px-1 text-xs text-gray-400">
                {method.code}
              </span>
              {!method.isActive && <Tag color="default">Inactive</Tag>}
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
              <span>Sort order {method.sortOrder || 0}</span>
              <span>
                {method.sourceType === "CARRIER"
                  ? "Carrier linked"
                  : "Manual rules"}
              </span>
              {method.providerCode && <span>{method.providerCode}</span>}
              {formatDeliveryEstimate(
                method.minDeliveryDays,
                method.maxDeliveryDays,
              ) && (
                <span>
                  ETA{" "}
                  {formatDeliveryEstimate(
                    method.minDeliveryDays,
                    method.maxDeliveryDays,
                  )}
                </span>
              )}
            </div>
            {method.description && (
              <div className="mt-1 text-sm text-gray-500">
                {method.description}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="small"
              type="text"
              icon={<Edit2 size={14} />}
              onClick={() => setIsMethodModalOpen(true)}
            >
              Edit
            </Button>
            <Button
              size="small"
              type="text"
              icon={<Plus size={14} />}
              onClick={handleAddRate}
            >
              Add Rate
            </Button>
            <Button
              size="small"
              type="text"
              danger
              icon={<Trash2 size={14} />}
              onClick={handleDeleteMethod}
            />
          </div>
        </div>
        <div className="pl-6">
          <ShippingRates
            rates={method.rates}
            zoneId={zoneId}
            onEditRate={handleEditRate}
            onDeleteRate={handleDeleteRate}
          />
        </div>
      </div>

      <MethodModal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        editingMethod={method}
        selectedZoneId={zoneId}
      />

      <RateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        editingRate={editingRate}
        selectedMethodId={method.id}
        selectedZoneId={zoneId}
      />
    </>
  );
}
