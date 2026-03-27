"use client";

import React, { useState } from "react";
import { Button, Collapse, Tag, message } from "antd";
import { createShippingStarterPreset } from "@/actions/shipping";
import {
  getCarrierOption,
  SHIPPING_STARTER_PLAYBOOKS,
} from "@/lib/shipping-carriers";
import { useShipping } from "./ShippingProvider";

export default function StarterPresets() {
  const [creatingPreset, setCreatingPreset] = useState<string | null>(null);
  const { refreshProfiles, fetchZones } = useShipping();

  const handleCreateStarterPreset = async (preset: "gcc" | "india") => {
    try {
      setCreatingPreset(preset);
      const result = await createShippingStarterPreset(preset);
      await Promise.all([refreshProfiles(), fetchZones()]);
      message.success(
        `Starter setup added. ${result.createdZones} zone(s) and ${result.createdMethods} method(s) created.`,
      );
    } catch {
      message.error("Failed to create starter shipping setup");
    } finally {
      setCreatingPreset(null);
    }
  };

  return (
    <Collapse
      ghost
      items={[
        {
          key: "ready-made-starters",
          label: (
            <div className="pr-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Ready-made Starters
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Start with a ready-made setup for GCC or India, then adjust
                rates and activate the methods you want to use.
              </p>
            </div>
          ),
          children: (
            <div className="grid gap-4 pt-2 lg:grid-cols-2">
              {SHIPPING_STARTER_PLAYBOOKS.map((preset) => (
                <div
                  key={preset.code}
                  className="flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {preset.title}
                      </h3>
                      <Tag color="default" className="mr-0">
                        {preset.code.toUpperCase()}
                      </Tag>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {preset.description}
                    </p>
                    <p className="mt-3 text-sm text-gray-500">{preset.focus}</p>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Providers
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {preset.providers
                          .map(
                            (providerCode) =>
                              getCarrierOption(providerCode)?.label ||
                              providerCode,
                          )
                          .join(", ")}
                      </div>
                    </div>
                    <Button
                      type="primary"
                      loading={creatingPreset === preset.code}
                      onClick={() =>
                        handleCreateStarterPreset(
                          preset.code as "gcc" | "india",
                        )
                      }
                    >
                      Use Preset
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}
