"use client";

import React, { useState } from "react";
import { Drawer, Button, List, Typography, message } from "antd";
import { PAGE_PRESETS } from "@/constants/page-presets";
import { createPageFromPreset } from "@/actions/page-presets";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const { Text } = Typography;

interface PresetSidebarProps {
  open: boolean;
  onClose: () => void;
}

const PresetSidebar: React.FC<PresetSidebarProps> = ({ open, onClose }) => {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCreate = async (presetId: string) => {
    setLoadingId(presetId);
    try {
      const res = await createPageFromPreset(presetId);
      if (res.success && res.data) {
        message.success(`Page "${res.data.name}" created from preset`);
        onClose();
        router.push(`/admin/pages/${res.data.id}`);
        router.refresh();
      } else {
        message.error(res.error || "Failed to create page");
      }
    } catch (error: any) {
      console.error(error);
      message.error("An unexpected error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Drawer
      title={
        <div className="flex flex-col gap-1 py-4">
          <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Page Presets
          </h2>
          <p className="text-sm font-normal text-gray-400">
            Select a template to quickly generate a page
          </p>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={450}
      className="preset-drawer"
      styles={{
        header: { borderBottom: "1px solid #f3f4f6", padding: "0 24px" },
        body: { padding: "24px", background: "#f9fafb" },
      }}
    >
      <div className="flex flex-col gap-4">
        {PAGE_PRESETS.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 opacity-50" />

            <div className="relative flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-sm font-mono  tracking-wider">
                      /{item.slug}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2">
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  onClick={() => handleCreate(item.id)}
                  loading={loadingId === item.id}
                  className="w-full h-11 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center font-semibold tracking-wide"
                >
                  Create from this Preset
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
};

export default PresetSidebar;
