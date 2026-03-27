"use client";

import React, { useState } from "react";
import { Button, Empty } from "antd";
import { Plus } from "lucide-react";
import { useShipping } from "./ShippingProvider";
import ShippingZoneCard from "./ShippingZoneCard";
import ZoneModal from "./modals/ZoneModal";

export default function ShippingZones() {
  const { zones, loading } = useShipping();
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Shipping Zones</h2>
          <p className="text-sm text-gray-500">
            Configure service levels per market, then add flat, free, or
            price-band rules for each one.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsZoneModalOpen(true)}
        >
          Add Zone
        </Button>
      </div>

      {loading && zones.length === 0 ? (
        <div className="p-8 text-center text-gray-400">Loading settings...</div>
      ) : zones.length === 0 ? (
        <Empty description="No shipping zones setup yet" />
      ) : (
        <div className="grid gap-6">
          {zones.map((zone) => (
            <ShippingZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      )}

      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        editingZone={null}
      />
    </>
  );
}
