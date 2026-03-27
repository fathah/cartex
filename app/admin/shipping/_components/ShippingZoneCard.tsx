"use client";

import React, { useState } from "react";
import { Button, Card, message } from "antd";
import { Edit2, Globe, Plus, Trash2 } from "lucide-react";
import { deleteShippingZone } from "@/actions/shipping";
import ShippingMethodCard from "./ShippingMethodCard";
import MethodModal from "./modals/MethodModal";
import ZoneModal from "./modals/ZoneModal";
import { useShipping } from "./ShippingProvider";

interface ShippingZoneCardProps {
  zone: any;
}

export default function ShippingZoneCard({ zone }: ShippingZoneCardProps) {
  const { fetchZones } = useShipping();
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);

  const handleDeleteZone = async () => {
    try {
      await deleteShippingZone(zone.id);
      message.success("Zone deleted");
      fetchZones();
    } catch {
      message.error("Failed to delete zone");
    }
  };

  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <div className="mb-4 flex items-start justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-gray-400" />
              <h3 className="text-base font-bold">{zone.name}</h3>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {zone.areas.length > 0
                ? zone.areas.map((area: any) => area.country).join(", ")
                : "No regions defined"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="small"
              icon={<Edit2 size={14} />}
              onClick={() => setIsZoneModalOpen(true)}
            >
              Edit
            </Button>
            <Button
              size="small"
              danger
              icon={<Trash2 size={14} />}
              onClick={handleDeleteZone}
            />
          </div>
        </div>

        <div className="space-y-3">
          {zone.methods.map((method: any) => (
            <ShippingMethodCard
              key={method.id}
              method={method}
              zoneId={zone.id}
            />
          ))}

          <Button
            type="dashed"
            block
            icon={<Plus size={14} />}
            onClick={() => setIsMethodModalOpen(true)}
          >
            Add Shipping Method
          </Button>
        </div>
      </Card>

      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        editingZone={zone}
      />

      <MethodModal
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        editingMethod={null}
        selectedZoneId={zone.id}
      />
    </>
  );
}
