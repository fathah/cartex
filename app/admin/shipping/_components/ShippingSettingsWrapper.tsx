"use client";

import React from "react";
import { ShippingProvider } from "./ShippingProvider";
import StarterPresets from "./StarterPresets";
import ShippingProfiles from "./ShippingProfiles";
import ShippingZones from "./ShippingZones";

export default function ShippingSettingsWrapper() {
  return (
    <ShippingProvider>
      <div className="space-y-6">
        <StarterPresets />
        <ShippingProfiles />
        <ShippingZones />
      </div>
    </ShippingProvider>
  );
}
