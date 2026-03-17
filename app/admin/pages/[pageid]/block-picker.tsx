"use client";

import React from "react";
import { Modal, Tabs, Card, Typography } from "antd";
import {
  getGroupedBlockTypes,
  BlockDefinition,
} from "@/lib/pageblocks/registry";

const { Text, Paragraph } = Typography;

interface BlockPickerModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (type: string) => void;
}

const BlockPickerModal: React.FC<BlockPickerModalProps> = ({
  open,
  onCancel,
  onSelect,
}) => {
  const groupedBlocks = getGroupedBlockTypes();

  return (
    <Modal
      title="Add New Block"
      open={open}
      onCancel={onCancel}
      footer={null}
      width="80%"
      style={{ top: 40 }}
      styles={{ body: { padding: "24px 0", minHeight: "60vh" } }}
      destroyOnHidden
    >
      <Tabs
        tabPosition="left"
        items={groupedBlocks.map((group) => ({
          key: group.category,
          label: (
            <div className="py-2 px-4">
              <Text strong>{group.category}</Text>
            </div>
          ),
          children: (
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.blocks.map((block: BlockDefinition) => (
                  <Card
                    key={block.type}
                    hoverable
                    className="overflow-hidden border-2 hover:border-blue-500 transition-all duration-300 group"
                    cover={
                      <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={`/images/pageblocks/${block.type.toLowerCase()}.png`}
                          alt={block.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/600x400?text=No+Preview";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    }
                    onClick={() => onSelect(block.type)}
                  >
                    <div>
                      <h5 className="font-bold">{block.label}</h5>
                      <p className="text-gray-500 text-xs mb-0 line-clamp-2">
                        {block.description || "No description available."}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ),
        }))}
      />
    </Modal>
  );
};

export default BlockPickerModal;
